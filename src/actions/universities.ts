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
  universityCreateSchema,
  universityUpdateSchema,
} from "@/lib/validations";

const paths = [
  "/universities",
  "/dashboard",
  "/programs",
  "/professors",
  "/countries",
];

export async function createUniversity(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(universityCreateSchema, input);
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      const university = await prisma.university.create({ data: parsed.data });
      return { id: university.id };
    },
    paths,
  );
}

export async function updateUniversity(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(universityUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, ...data } = parsed.data;
  return runMutation(
    async () => {
      const university = await prisma.university.update({
        where: { id },
        data,
      });
      return { id: university.id };
    },
    [...paths, `/universities/${id}`],
  );
}

export async function deleteUniversity(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      await prisma.university.delete({ where: { id: parsed.data } });
      return { id: parsed.data };
    },
    paths,
  );
}

export async function getUniversity(id: string) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.university.findUnique({
    where: { id: parsed.data },
    include: {
      country: true,
      city: true,
      programs: { orderBy: { name: "asc" } },
      professors: { orderBy: { fullName: "asc" } },
      scholarships: { orderBy: { deadline: "asc" } },
      linkedNotes: { orderBy: { updatedAt: "desc" } },
      tasks: { orderBy: { dueDate: "asc" } },
    },
  });
}

export async function listUniversities(filters?: {
  countryId?: string;
  status?: string;
  priority?: string;
}) {
  return prisma.university.findMany({
    where: {
      countryId: filters?.countryId,
      status: filters?.status as never,
      priority: filters?.priority as never,
    },
    orderBy: [{ priority: "desc" }, { name: "asc" }],
    include: {
      country: { select: { id: true, name: true, code: true } },
      city: { select: { id: true, name: true } },
      _count: {
        select: { programs: true, professors: true, scholarships: true },
      },
    },
  });
}
