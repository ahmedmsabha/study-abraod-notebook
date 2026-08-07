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
  requirementCreateSchema,
  requirementUpdateSchema,
} from "@/lib/validations";

const paths = ["/programs", "/universities", "/dashboard", "/applications"];

export async function createRequirement(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(requirementCreateSchema, input);
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      const requirement = await prisma.requirement.create({
        data: parsed.data,
      });
      return { id: requirement.id };
    },
    [...paths, `/programs/${parsed.data.programId}`],
  );
}

export async function updateRequirement(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(requirementUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, ...data } = parsed.data;
  return runMutation(
    async () => {
      const requirement = await prisma.requirement.update({
        where: { id },
        data,
      });
      return { id: requirement.id };
    },
    [
      ...paths,
      data.programId ? `/programs/${data.programId}` : undefined,
    ].filter(Boolean) as string[],
  );
}

export async function toggleRequirementCompleted(
  id: string,
  isCompleted: boolean,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, id);
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      const requirement = await prisma.requirement.update({
        where: { id: parsed.data },
        data: { isCompleted },
      });
      return { id: requirement.id };
    },
    paths,
  );
}

export async function deleteRequirement(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      await prisma.requirement.delete({ where: { id: parsed.data } });
      return { id: parsed.data };
    },
    paths,
  );
}

export async function listRequirements(programId: string) {
  return prisma.requirement.findMany({
    where: { programId },
    orderBy: [{ isCompleted: "asc" }, { category: "asc" }, { title: "asc" }],
  });
}
