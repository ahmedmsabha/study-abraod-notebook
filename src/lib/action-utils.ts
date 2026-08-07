import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "../../generated/prisma/client";
import { routing } from "@/i18n/routing";

export type ActionSuccess<T> = {
  success: true;
  data: T;
};

export type ActionFailure = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure;

export function ok<T>(data: T): ActionSuccess<T> {
  return { success: true, data };
}

export function fail(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionFailure {
  return { success: false, error, fieldErrors };
}

export function validationFail(error: z.ZodError): ActionFailure {
  const flat = z.flattenError(error);
  return fail("Validation failed", flat.fieldErrors as Record<string, string[]>);
}

export function parseInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): { success: true; data: z.infer<TSchema> } | ActionFailure {
  const normalized =
    input instanceof FormData ? Object.fromEntries(input.entries()) : input;
  const parsed = schema.safeParse(normalized);
  if (!parsed.success) {
    return validationFail(parsed.error);
  }
  return { success: true, data: parsed.data };
}

/** Accept raw id string, `{ id }`, or FormData with `id`. */
export function resolveIdInput(input: unknown): unknown {
  if (typeof input === "string") return input;
  if (input instanceof FormData) return input.get("id");
  if (input && typeof input === "object" && "id" in input) {
    return (input as { id: unknown }).id;
  }
  return input;
}

/** Revalidate the same path for every locale prefix. */
export function revalidateLocalePaths(...paths: string[]) {
  try {
    for (const locale of routing.locales) {
      for (const path of paths) {
        const normalized = path.startsWith("/") ? path : `/${path}`;
        revalidatePath(`/${locale}${normalized}`);
      }
    }
  } catch {
    // Outside a Next.js request (e.g. CLI smoke tests), cache revalidation is unavailable.
  }
}

export function prismaErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A record with this unique value already exists.";
    }
    if (error.code === "P2025") {
      return "Record not found.";
    }
    if (error.code === "P2003") {
      return "Related record not found.";
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected database error.";
}

export async function runMutation<T>(
  work: () => Promise<T>,
  paths: string[],
): Promise<ActionResult<T>> {
  try {
    const data = await work();
    revalidateLocalePaths(...paths);
    return ok(data);
  } catch (error) {
    return fail(prismaErrorMessage(error));
  }
}
