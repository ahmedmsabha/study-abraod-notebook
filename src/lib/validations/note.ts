import { z } from "zod";
import { idSchema, optionalId, requiredName, stringList } from "./common";

export const noteCreateSchema = z.object({
  title: requiredName,
  content: z
    .string()
    .trim()
    .min(1, { error: "Content is required" }),
  tags: stringList.default([]),
  countryId: optionalId,
  universityId: optionalId,
  programId: optionalId,
  professorId: optionalId,
  scholarshipId: optionalId,
});

export const noteUpdateSchema = noteCreateSchema.partial().extend({
  id: idSchema,
});

export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
