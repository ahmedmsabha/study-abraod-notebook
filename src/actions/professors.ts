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
import {
  parseProfessorCsvRow,
  universityLookupKey,
} from "@/lib/csv/professors";
import {
  idSchema,
  professorCreateSchema,
  professorUpdateSchema,
} from "@/lib/validations";

const paths = [
  "/professors",
  "/universities",
  "/programs",
  "/dashboard",
  "/tasks",
];

export async function createProfessor(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(professorCreateSchema, input);
  if (!parsed.success) return parsed;

  const { programIds, ...data } = parsed.data;

  return runMutation(
    async () => {
      const professor = await prisma.professor.create({
        data: {
          ...data,
          programs: programIds?.length
            ? { connect: programIds.map((id) => ({ id })) }
            : undefined,
        },
      });
      return { id: professor.id };
    },
    [...paths, `/universities/${data.universityId}`],
  );
}

export async function updateProfessor(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(professorUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, programIds, ...data } = parsed.data;

  return runMutation(
    async () => {
      const professor = await prisma.professor.update({
        where: { id },
        data: {
          ...data,
          programs:
            programIds !== undefined
              ? { set: programIds.map((programId) => ({ id: programId })) }
              : undefined,
        },
      });
      return { id: professor.id };
    },
    [...paths, `/professors/${id}`],
  );
}

export async function deleteProfessor(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      await prisma.professor.delete({ where: { id: parsed.data } });
      return { id: parsed.data };
    },
    paths,
  );
}

export async function getProfessor(id: string) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.professor.findUnique({
    where: { id: parsed.data },
    include: {
      university: { include: { country: true } },
      programs: { orderBy: { name: "asc" } },
      contactLogs: { orderBy: { date: "desc" } },
      linkedNotes: { orderBy: { updatedAt: "desc" } },
      tasks: { orderBy: { dueDate: "asc" } },
    },
  });
}

export async function listProfessors(filters?: {
  countryId?: string;
  universityId?: string;
  contactStatus?: string;
  acceptingStudents?: string;
  researchKeyword?: string;
  generalSpecialization?: string;
}) {
  const keyword = filters?.researchKeyword?.trim();

  return prisma.professor.findMany({
    where: {
      universityId: filters?.universityId,
      contactStatus: filters?.contactStatus as never,
      acceptingStudents: filters?.acceptingStudents as never,
      generalSpecialization: filters?.generalSpecialization
        ? {
            contains: filters.generalSpecialization,
            mode: "insensitive",
          }
        : undefined,
      university: filters?.countryId
        ? { countryId: filters.countryId }
        : undefined,
      OR: keyword
        ? [
            { researchKeywords: { has: keyword } },
            {
              researchSpecializations: {
                hasSome: [keyword],
              },
            },
            {
              generalSpecialization: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          ]
        : undefined,
    },
    orderBy: [{ fitScore: "desc" }, { fullName: "asc" }],
    include: {
      university: {
        select: {
          id: true,
          name: true,
          country: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });
}

export type ImportProfessorsResult = {
  created: number;
  skipped: number;
  errors: string[];
};

/** Import professors from CSV rows keyed by template headers. */
export async function importProfessorsFromCsv(
  rows: Record<string, string>[],
): Promise<ActionResult<ImportProfessorsResult>> {
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
    const universityPaths = new Set<string>();

    for (let index = 0; index < rows.length; index += 1) {
      const parsed = parseProfessorCsvRow(rows[index] ?? {}, index);
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

      const validated = professorCreateSchema.safeParse({
        universityId,
        fullName: parsed.data.fullName,
        generalSpecialization: parsed.data.generalSpecialization,
        researchSpecializations: parsed.data.researchSpecializations,
        linkedinUrl: parsed.data.linkedinUrl,
        officialProfileUrl: parsed.data.officialProfileUrl,
        labUrl: parsed.data.labUrl,
        googleScholarUrl: parsed.data.googleScholarUrl,
        email: parsed.data.email,
        acceptingStudents: parsed.data.acceptingStudents,
        fitScore: parsed.data.fitScore,
        contactStatus: parsed.data.contactStatus,
        notes: parsed.data.notes,
      });

      if (!validated.success) {
        const message = validated.error.issues[0]?.message ?? "Invalid row";
        errors.push(`Row ${index + 2}: ${message}`);
        skipped += 1;
        continue;
      }

      const { programIds, ...data } = validated.data;
      void programIds;
      await prisma.professor.create({ data });
      universityPaths.add(`/universities/${universityId}`);
      created += 1;
    }

    revalidateLocalePaths(...paths, ...universityPaths);
    return ok({ created, skipped, errors });
  } catch (error) {
    return fail(prismaErrorMessage(error));
  }
}
