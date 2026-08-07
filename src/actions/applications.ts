"use server";

import { prisma } from "@/lib/prisma";
import {
  parseInput,
  resolveIdInput,
  runMutation,
  type ActionResult,
} from "@/lib/action-utils";
import {
  applicationCreateSchema,
  applicationStatusOnlySchema,
  applicationUpdateSchema,
  idSchema,
} from "@/lib/validations";

const paths = ["/applications", "/dashboard", "/programs", "/tasks"];

export async function createApplication(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(applicationCreateSchema, input);
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      const application = await prisma.application.create({
        data: parsed.data,
      });
      return { id: application.id };
    },
    [...paths, `/programs/${parsed.data.programId}`],
  );
}

export async function updateApplication(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(applicationUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, ...data } = parsed.data;
  return runMutation(
    async () => {
      const application = await prisma.application.update({
        where: { id },
        data,
      });
      return { id: application.id };
    },
    paths,
  );
}

export async function updateApplicationStatus(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(applicationStatusOnlySchema, input);
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      const application = await prisma.application.update({
        where: { id: parsed.data.id },
        data: { status: parsed.data.status },
      });
      return { id: application.id };
    },
    paths,
  );
}

export async function deleteApplication(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      await prisma.application.delete({ where: { id: parsed.data } });
      return { id: parsed.data };
    },
    paths,
  );
}

export async function getApplication(id: string) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.application.findUnique({
    where: { id: parsed.data },
    include: {
      program: {
        include: {
          university: { include: { country: true } },
          requirements: true,
        },
      },
    },
  });
}

export async function listApplications() {
  return prisma.application.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      program: {
        include: {
          university: {
            select: {
              id: true,
              name: true,
              country: { select: { id: true, name: true, code: true } },
            },
          },
          tasks: {
            where: { status: { not: "DONE" } },
            orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
            take: 1,
            select: {
              id: true,
              title: true,
              dueDate: true,
              status: true,
              priority: true,
            },
          },
        },
      },
    },
  });
}
