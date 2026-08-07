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
  placeCreateSchema,
  placeUpdateSchema,
} from "@/lib/validations";

const paths = ["/local-life", "/countries", "/dashboard"];

export async function createPlace(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(placeCreateSchema, input);
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      const place = await prisma.place.create({ data: parsed.data });
      return { id: place.id };
    },
    paths,
  );
}

export async function updatePlace(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(placeUpdateSchema, input);
  if (!parsed.success) return parsed;

  const { id, ...data } = parsed.data;
  return runMutation(
    async () => {
      const place = await prisma.place.update({ where: { id }, data });
      return { id: place.id };
    },
    paths,
  );
}

export async function deletePlace(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(idSchema, resolveIdInput(input));
  if (!parsed.success) return parsed;

  return runMutation(
    async () => {
      await prisma.place.delete({ where: { id: parsed.data } });
      return { id: parsed.data };
    },
    paths,
  );
}

export async function getPlace(id: string) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;
  return prisma.place.findUnique({
    where: { id: parsed.data },
    include: {
      city: { include: { country: true } },
    },
  });
}

export async function listPlaces(filters?: {
  cityId?: string;
  countryId?: string;
  category?: string;
}) {
  return prisma.place.findMany({
    where: {
      cityId: filters?.cityId,
      category: filters?.category as never,
      city: filters?.countryId
        ? { countryId: filters.countryId }
        : undefined,
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      city: {
        select: {
          id: true,
          name: true,
          country: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });
}
