"use server";

import { prisma } from "@/lib/prisma";
import {
  parseInput,
  resolveIdInput,
  runMutation,
  type ActionResult,
} from "@/lib/action-utils";
import {
  idSchema,
  scholarshipCreateSchema,
  scholarshipUpdateSchema,
} from "@/lib/validations";

const paths = [
  "/scholarships",
  "/dashboard",
  "/countries",
  "/universities",
  "/tasks",
];

export async function createScholarship(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(scholarshipCreateSchema, input);
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      const scholarship = await prisma.scholarship.create({
        data: parsed.data,
      });
      return { id: scholarship.id };
    },
    paths,
  );
}

export async function updateScholarship(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(scholarshipUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, ...data } = parsed.data;
  return runMutation(
    async () => {
      const scholarship = await prisma.scholarship.update({
        where: { id },
        data,
      });
      return { id: scholarship.id };
    },
    [...paths, `/scholarships/${id}`],
  );
}

export async function deleteScholarship(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      await prisma.scholarship.delete({ where: { id: parsed.data } });
      return { id: parsed.data };
    },
    paths,
  );
}

export async function getScholarship(id: string) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.scholarship.findUnique({
    where: { id: parsed.data },
    include: {
      university: { include: { country: true } },
      country: true,
      linkedNotes: { orderBy: { updatedAt: "desc" } },
      tasks: { orderBy: { dueDate: "asc" } },
    },
  });
}

export async function listScholarships(filters?: {
  countryId?: string;
  universityId?: string;
  fundingType?: string;
  status?: string;
}) {
  return prisma.scholarship.findMany({
    where: {
      countryId: filters?.countryId,
      universityId: filters?.universityId,
      fundingType: filters?.fundingType as never,
      status: filters?.status as never,
    },
    orderBy: [{ deadline: "asc" }, { name: "asc" }],
    include: {
      country: { select: { id: true, name: true, code: true } },
      university: { select: { id: true, name: true } },
    },
  });
}
