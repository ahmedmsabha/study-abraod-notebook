import type { FieldValues, Resolver } from "react-hook-form";
import { zodResolver as rhfZodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";

/**
 * React Hook Form + Zod 4 wiring.
 * Cast keeps transform/output schemas usable with RHF field values.
 */
export function zodResolver<TFieldValues extends FieldValues>(
  schema: ZodType<TFieldValues>,
): Resolver<TFieldValues> {
  return rhfZodResolver(schema as never) as Resolver<TFieldValues>;
}