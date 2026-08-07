import { z } from "zod";
import {
  booleanField,
  idSchema,
  optionalDate,
  optionalDecimal,
  optionalScore,
  optionalText,
  optionalUrl,
  requiredName,
  stringList,
} from "./common";
import {
  degreeTypeSchema,
  programModeSchema,
  requirementCategorySchema,
} from "./enums";

export const programCreateSchema = z.object({
  universityId: idSchema,
  name: requiredName,
  degreeType: degreeTypeSchema.default("MSc"),
  department: optionalText,
  mode: programModeSchema.default("UNKNOWN"),
  duration: optionalText,
  officialUrl: optionalUrl,
  applicationDeadline: optionalDate,
  intakeTerm: optionalText,
  tuitionAmount: optionalDecimal,
  currency: optionalText,
  minimumGpa: optionalText,
  languageRequirement: optionalText,
  greRequired: booleanField.default(false),
  supervisorRequired: booleanField.default(false),
  applicationFee: optionalDecimal,
  requiredDocuments: optionalText,
  suitableForMeScore: optionalScore,
  fitReason: optionalText,
  notes: optionalText,
  professorIds: stringList.optional(),
});

export const programUpdateSchema = programCreateSchema.partial().extend({
  id: idSchema,
});

export const requirementCreateSchema = z.object({
  programId: idSchema,
  category: requirementCategorySchema.default("OTHER"),
  title: requiredName,
  details: optionalText,
  minimumValue: optionalText,
  officialSourceUrl: optionalUrl,
  verifiedAt: optionalDate,
  isCompleted: booleanField.default(false),
  notes: optionalText,
});

export const requirementUpdateSchema = requirementCreateSchema.partial().extend({
  id: idSchema,
});

export type ProgramCreateInput = z.infer<typeof programCreateSchema>;
export type ProgramUpdateInput = z.infer<typeof programUpdateSchema>;
export type RequirementCreateInput = z.infer<typeof requirementCreateSchema>;
export type RequirementUpdateInput = z.infer<typeof requirementUpdateSchema>;
