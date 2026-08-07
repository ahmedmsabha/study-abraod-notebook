"use server";

import { prisma } from "@/lib/prisma";
import {
  parseInput,
  resolveIdInput,
  runMutation,
  type ActionResult,
} from "@/lib/action-utils";
import {
  countryCreateSchema,
  countryUpdateSchema,
  idSchema,
} from "@/lib/validations";

const paths = ["/countries", "/dashboard", "/universities", "/scholarships"];

export async function createCountry(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(countryCreateSchema, input);
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      const country = await prisma.country.create({ data: parsed.data });
      return { id: country.id };
    },
    paths,
  );
}

export async function updateCountry(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(countryUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, ...data } = parsed.data;
  return runMutation(
    async () => {
      const country = await prisma.country.update({ where: { id }, data });
      return { id: country.id };
    },
    [...paths, `/countries/${id}`],
  );
}

export async function deleteCountry(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      await prisma.country.delete({ where: { id: parsed.data } });
      return { id: parsed.data };
    },
    paths,
  );
}

export async function getCountry(id: string) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.country.findUnique({
    where: { id: parsed.data },
    include: {
      cities: { orderBy: { name: "asc" } },
      universities: { orderBy: { name: "asc" } },
      scholarships: { orderBy: { deadline: "asc" } },
    },
  });
}

export async function listCountries() {
  return prisma.country.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { cities: true, universities: true, scholarships: true },
      },
    },
  });
}
