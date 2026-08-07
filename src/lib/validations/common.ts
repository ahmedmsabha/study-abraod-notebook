import { z } from "zod";

/** Treat missing object keys as null before validating/transforming. */
function missingToNull(value: unknown) {
  return value === undefined ? null : value;
}

export const optionalText = z.preprocess(
  missingToNull,
  z.union([z.string(), z.null()]).transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }),
);

export const optionalUrl = z.preprocess(
  missingToNull,
  z.union([z.string(), z.null()]).transform((value, ctx) => {
    if (value == null) return null;
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const parsed = z.url({ error: "Enter a valid URL (https://…)" }).safeParse(trimmed);
    if (!parsed.success) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid URL (https://…)",
      });
      return z.NEVER;
    }
    return parsed.data;
  }),
);

export const optionalEmail = z.preprocess(
  missingToNull,
  z.union([z.string(), z.null()]).transform((value, ctx) => {
    if (value == null) return null;
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const parsed = z.email({ error: "Enter a valid email address" }).safeParse(trimmed);
    if (!parsed.success) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid email address",
      });
      return z.NEVER;
    }
    return parsed.data;
  }),
);

export const optionalDate = z.preprocess(
  missingToNull,
  z.union([z.date(), z.string(), z.null()]).transform((value, ctx) => {
    if (value == null || value === "") return null;
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        ctx.addIssue({ code: "custom", message: "Enter a valid date" });
        return z.NEVER;
      }
      return value;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({ code: "custom", message: "Enter a valid date" });
      return z.NEVER;
    }
    return parsed;
  }),
);

export const optionalDecimal = z.preprocess(
  missingToNull,
  z.union([z.number(), z.string(), z.null()]).transform((value, ctx) => {
    if (value == null || value === "") return null;
    const number = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(number)) {
      ctx.addIssue({ code: "custom", message: "Enter a valid number" });
      return z.NEVER;
    }
    return number;
  }),
);

export const optionalScore = z.preprocess(
  missingToNull,
  z.union([z.number(), z.string(), z.null()]).transform((value, ctx) => {
    if (value == null || value === "") return null;
    const number = typeof value === "number" ? value : Number(value);
    if (!Number.isInteger(number) || number < 1 || number > 10) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a score from 1 to 10",
      });
      return z.NEVER;
    }
    return number;
  }),
);

export const optionalRating = z.preprocess(
  missingToNull,
  z.union([z.number(), z.string(), z.null()]).transform((value, ctx) => {
    if (value == null || value === "") return null;
    const number = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(number) || number < 0 || number > 5) {
      ctx.addIssue({ code: "custom", message: "Enter a rating from 0 to 5" });
      return z.NEVER;
    }
    return number;
  }),
);

export const booleanField = z.preprocess(
  missingToNull,
  z.union([z.boolean(), z.string(), z.number(), z.null()]).transform((value) => {
    if (value === "on" || value === "true" || value === true || value === 1 || value === "1") {
      return true;
    }
    return false;
  }),
);

export const stringList = z.preprocess(
  missingToNull,
  z.union([z.array(z.string()), z.string(), z.null()]).transform((value) => {
    if (value == null || value === "") return [] as string[];
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }),
);

export const idSchema = z.cuid({ error: "Invalid id" });

export const optionalId = z.preprocess(
  missingToNull,
  z.union([idSchema, z.literal(""), z.null()]).transform((value) => {
    if (value == null || value === "") return null;
    return value;
  }),
);

export const requiredName = z
  .string()
  .trim()
  .min(1, { error: "Name is required" })
  .max(200, { error: "Name is too long" });

export const countryCode = z
  .string()
  .trim()
  .min(2, { error: "Country code is required" })
  .max(8, { error: "Country code is too long" })
  .transform((value) => value.toUpperCase());
