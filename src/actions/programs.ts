"use server";

import { prisma } from "@/lib/prisma";
import {
  fail,
  ok,
  parseInput,
  prismaErrorMessage,
  revalidateLocalePaths,
  resolveIdInput,
  runMutation,
  type ActionResult,
} from "@/lib/action-utils";
import { universityLookupKey } from "@/lib/csv/lookup";
import { parseProgramCsvRow } from "@/lib/csv/programs";
import {
  idSchema,
  programCreateSchema,
  programUpdateSchema,
} from "@/lib/validations";
import { DegreeType } from "../../generated/prisma/enums";

const paths = [
  "/programs",
  "/universities",
  "/dashboard",
  "/applications",
  "/professors",
];

function professorConnect(ids?: string[]) {
  if (!ids) return undefined;
  return { set: ids.map((id) => ({ id })) };
}

export async function createProgram(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(programCreateSchema, input);
  if (!parsed.success) return parsed;

  const { professorIds, ...data } = parsed.data;

  return runMutation(
    async () => {
      const program = await prisma.program.create({
        data: {
          ...data,
          professors: professorIds?.length
            ? { connect: professorIds.map((id) => ({ id })) }
            : undefined,
        },
      });
      return { id: program.id };
    },
    [...paths, `/universities/${data.universityId}`],
  );
}

export async function updateProgram(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(programUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, professorIds, ...data } = parsed.data;

  return runMutation(
    async () => {
      const program = await prisma.program.update({
        where: { id },
        data: {
          ...data,
          professors:
            professorIds !== undefined
              ? professorConnect(professorIds)
              : undefined,
        },
      });
      return { id: program.id };
    },
    [...paths, `/programs/${id}`],
  );
}

export async function deleteProgram(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      await prisma.program.delete({ where: { id: parsed.data } });
      return { id: parsed.data };
    },
    paths,
  );
}

export async function getProgram(id: string) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.program.findUnique({
    where: { id: parsed.data },
    include: {
      university: { include: { country: true } },
      requirements: { orderBy: [{ isCompleted: "asc" }, { title: "asc" }] },
      professors: { orderBy: { fullName: "asc" } },
      applications: true,
      linkedNotes: { orderBy: { updatedAt: "desc" } },
      tasks: { orderBy: { dueDate: "asc" } },
    },
  });
}

export async function listPrograms(filters?: {
  universityId?: string;
  countryId?: string;
  degreeType?: string;
}) {
  return prisma.program.findMany({
    where: {
      universityId: filters?.universityId,
      degreeType: filters?.degreeType as never,
      university: filters?.countryId
        ? { countryId: filters.countryId }
        : undefined,
    },
    orderBy: [{ applicationDeadline: "asc" }, { name: "asc" }],
    include: {
      university: {
        select: {
          id: true,
          name: true,
          status: true,
          country: { select: { id: true, name: true, code: true } },
        },
      },
      _count: { select: { requirements: true, applications: true } },
    },
  });
}

export type ImportProgramsResult = {
  created: number;
  skipped: number;
  requirementsCreated: number;
  errors: string[];
};

/** Import programs (and document checklist items) from CSV template rows. */
export async function importProgramsFromCsv(
  rows: Record<string, string>[],
): Promise<ActionResult<ImportProgramsResult>> {
  if (!Array.isArray(rows) || rows.length === 0) {
    return fail("No CSV rows to import.");
  }

  try {
    const universities = await prisma.university.findMany({
      select: {
        id: true,
        name: true,
        country: { select: { name: true } },
      },
    });

    const universityByKey = new Map(
      universities.map((university) => [
        universityLookupKey(university.name, university.country.name),
        university.id,
      ]),
    );

    const errors: string[] = [];
    let created = 0;
    let skipped = 0;
    let requirementsCreated = 0;
    const universityPaths = new Set<string>();

    for (let index = 0; index < rows.length; index += 1) {
      const parsed = parseProgramCsvRow(rows[index] ?? {}, index);
      if (parsed.error || !parsed.data) {
        errors.push(parsed.error ?? `Row ${index + 2}: Invalid row.`);
        skipped += 1;
        continue;
      }

      const universityId = universityByKey.get(
        universityLookupKey(
          parsed.data.universityName,
          parsed.data.countryName,
        ),
      );

      if (!universityId) {
        errors.push(
          `Row ${index + 2}: No university matching "${parsed.data.universityName}" in "${parsed.data.countryName}". Add the university first.`,
        );
        skipped += 1;
        continue;
      }

      const degreeType = Object.values(DegreeType).includes(
        parsed.data.degreeType as DegreeType,
      )
        ? (parsed.data.degreeType as DegreeType)
        : DegreeType.Other;

      const noteParts = [
        parsed.data.notes,
        parsed.data.tuitionNotes
          ? `Tuition notes: ${parsed.data.tuitionNotes}`
          : null,
      ].filter(Boolean);

      const validated = programCreateSchema.safeParse({
        universityId,
        name: parsed.data.name,
        degreeType,
        department: parsed.data.department,
        officialUrl: parsed.data.officialUrl,
        applicationDeadline: parsed.data.applicationDeadline,
        languageRequirement: parsed.data.languageRequirement,
        minimumGpa: parsed.data.minimumGpa,
        supervisorRequired: parsed.data.supervisorRequired,
        requiredDocuments: parsed.data.requiredDocuments,
        fitReason: parsed.data.fitReason,
        notes: noteParts.length > 0 ? noteParts.join("\n") : null,
      });

      if (!validated.success) {
        const message = validated.error.issues[0]?.message ?? "Invalid row";
        errors.push(`Row ${index + 2}: ${message}`);
        skipped += 1;
        continue;
      }

      const { professorIds, ...data } = validated.data;
      void professorIds;

      const program = await prisma.program.create({ data });
      universityPaths.add(`/universities/${universityId}`);
      created += 1;

      const documentTitles = (parsed.data.requiredDocuments ?? "")
        .split(/[,;|]/)
        .map((part) => part.trim())
        .filter(Boolean);

      if (documentTitles.length > 0) {
        await prisma.requirement.createMany({
          data: documentTitles.map((title) => ({
            programId: program.id,
            category: "OTHER" as const,
            title,
            details: "Imported from programs CSV Required Documents column",
          })),
        });
        requirementsCreated += documentTitles.length;
      }
    }

    revalidateLocalePaths(...paths, ...universityPaths);
    return ok({ created, skipped, requirementsCreated, errors });
  } catch (error) {
    return fail(prismaErrorMessage(error));
  }
}
