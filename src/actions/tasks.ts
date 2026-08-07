"use server";

import { prisma } from "@/lib/prisma";
import {
  parseInput,
  resolveIdInput,
  runMutation,
  type ActionResult,
} from "@/lib/action-utils";
import { idSchema, taskCreateSchema, taskUpdateSchema } from "@/lib/validations";

const paths = ["/tasks", "/dashboard", "/applications", "/professors"];

export async function createTask(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(taskCreateSchema, input);
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      const task = await prisma.task.create({ data: parsed.data });
      return { id: task.id };
    },
    paths,
  );
}

export async function updateTask(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(taskUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, ...data } = parsed.data;
  return runMutation(
    async () => {
      const task = await prisma.task.update({ where: { id }, data });
      return { id: task.id };
    },
    paths,
  );
}

export async function deleteTask(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      await prisma.task.delete({ where: { id: parsed.data } });
      return { id: parsed.data };
    },
    paths,
  );
}

export async function getTask(id: string) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.task.findUnique({
    where: { id: parsed.data },
    include: {
      relatedUniversity: true,
      relatedProgram: true,
      relatedScholarship: true,
      relatedProfessor: true,
    },
  });
}

export async function listTasks(filters?: {
  status?: string;
  priority?: string;
}) {
  return prisma.task.findMany({
    where: {
      status: filters?.status as never,
      priority: filters?.priority as never,
    },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    include: {
      relatedUniversity: { select: { id: true, name: true } },
      relatedProgram: { select: { id: true, name: true } },
      relatedScholarship: { select: { id: true, name: true } },
      relatedProfessor: { select: { id: true, fullName: true } },
    },
  });
}
