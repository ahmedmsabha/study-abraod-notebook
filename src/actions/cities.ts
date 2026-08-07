"use server";

import { prisma } from "@/lib/prisma";
import {
  parseInput,
  resolveIdInput,
  runMutation,
  type ActionResult,
} from "@/lib/action-utils";
import { cityCreateSchema, cityUpdateSchema, idSchema } from "@/lib/validations";

const paths = ["/countries", "/local-life", "/universities", "/dashboard"];

export async function createCity(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(cityCreateSchema, input);
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      const city = await prisma.city.create({ data: parsed.data });
      return { id: city.id };
    },
    [...paths, `/countries/${parsed.data.countryId}`],
  );
}

export async function updateCity(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(cityUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, ...data } = parsed.data;
  return runMutation(
    async () => {
      const city = await prisma.city.update({ where: { id }, data });
      return { id: city.id };
    },
    [...paths, data.countryId ? `/countries/${data.countryId}` : undefined].filter(
      Boolean,
    ) as string[],
  );
}

export async function deleteCity(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      await prisma.city.delete({ where: { id: parsed.data } });
      return { id: parsed.data };
    },
    paths,
  );
}

export async function getCity(id: string) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.city.findUnique({
    where: { id: parsed.data },
    include: {
      country: true,
      places: { orderBy: { name: "asc" } },
      universities: { orderBy: { name: "asc" } },
    },
  });
}

export async function listCities(countryId?: string) {
  return prisma.city.findMany({
    where: countryId ? { countryId } : undefined,
    orderBy: [{ country: { name: "asc" } }, { name: "asc" }],
    include: {
      country: { select: { id: true, name: true, code: true } },
      _count: { select: { places: true, universities: true } },
    },
  });
}
