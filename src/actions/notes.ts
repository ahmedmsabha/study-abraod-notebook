"use server";

import { prisma } from "@/lib/prisma";
import {
  parseInput,
  resolveIdInput,
  runMutation,
  type ActionResult,
} from "@/lib/action-utils";
import { idSchema, noteCreateSchema, noteUpdateSchema } from "@/lib/validations";

const paths = [
  "/notes",
  "/dashboard",
  "/universities",
  "/professors",
  "/programs",
  "/scholarships",
  "/countries",
];

export async function createNote(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(noteCreateSchema, input);
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      const note = await prisma.note.create({ data: parsed.data });
      return { id: note.id };
    },
    paths,
  );
}

export async function updateNote(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(noteUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, ...data } = parsed.data;
  return runMutation(
    async () => {
      const note = await prisma.note.update({ where: { id }, data });
      return { id: note.id };
    },
    [...paths, `/notes/${id}`],
  );
}

export async function deleteNote(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      await prisma.note.delete({ where: { id: parsed.data } });
      return { id: parsed.data };
    },
    paths,
  );
}

export async function getNote(id: string) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.note.findUnique({
    where: { id: parsed.data },
    include: {
      country: true,
      university: true,
      program: true,
      professor: true,
      scholarship: true,
    },
  });
}

export async function listNotes(filters?: {
  tag?: string;
  search?: string;
  countryId?: string;
  universityId?: string;
  programId?: string;
  professorId?: string;
  scholarshipId?: string;
}) {
  const search = filters?.search?.trim();
  const tag = filters?.tag?.trim();

  return prisma.note.findMany({
    where: {
      countryId: filters?.countryId,
      universityId: filters?.universityId,
      programId: filters?.programId,
      professorId: filters?.professorId,
      scholarshipId: filters?.scholarshipId,
      tags: tag ? { has: tag } : undefined,
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      country: { select: { id: true, name: true } },
      university: { select: { id: true, name: true } },
      program: { select: { id: true, name: true } },
      professor: { select: { id: true, fullName: true } },
      scholarship: { select: { id: true, name: true } },
    },
  });
}
