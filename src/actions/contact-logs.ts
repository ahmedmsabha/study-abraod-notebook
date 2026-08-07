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
  contactLogCreateSchema,
  contactLogUpdateSchema,
  idSchema,
} from "@/lib/validations";

const paths = ["/professors", "/dashboard", "/tasks"];

export async function createContactLog(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(contactLogCreateSchema, input);
  if (!parsed.success) return parsed;

  const { date, ...rest } = parsed.data;

  return runMutation(
    async () => {
      const log = await prisma.contactLog.create({
        data: {
          ...rest,
          date: date ?? new Date(),
        },
      });
      return { id: log.id };
    },
    [...paths, `/professors/${parsed.data.professorId}`],
  );
}

export async function updateContactLog(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(contactLogUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, ...data } = parsed.data;
  return runMutation(
    async () => {
      const log = await prisma.contactLog.update({
        where: { id },
        data: data as Parameters<typeof prisma.contactLog.update>[0]["data"],
      });
      return { id: log.id };
    },
    [
      ...paths,
      data.professorId ? `/professors/${data.professorId}` : undefined,
    ].filter(Boolean) as string[],
  );
}

export async function deleteContactLog(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  try {
    const existing = await prisma.contactLog.findUnique({
      where: { id: parsed.data },
      select: { professorId: true },
    });
    await prisma.contactLog.delete({ where: { id: parsed.data } });
    revalidateLocalePaths(
      ...paths,
      ...(existing?.professorId
        ? [`/professors/${existing.professorId}`]
        : []),
    );
    return ok({ id: parsed.data });
  } catch (error) {
    return fail(prismaErrorMessage(error));
  }
}

export async function listContactLogs(professorId: string) {
  return prisma.contactLog.findMany({
    where: { professorId },
    orderBy: { date: "desc" },
  });
}
