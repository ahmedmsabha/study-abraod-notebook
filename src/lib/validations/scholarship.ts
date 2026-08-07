import { z } from "zod";
import {
  idSchema,
  optionalDate,
  optionalDecimal,
  optionalId,
  optionalText,
  optionalUrl,
  requiredName,
} from "./common";
import { fundingTypeSchema, scholarshipStatusSchema } from "./enums";

export const scholarshipCreateSchema = z.object({
  universityId: optionalId,
  countryId: optionalId,
  name: requiredName,
  provider: optionalText,
  officialUrl: optionalUrl,
  fundingType: fundingTypeSchema.default("OTHER"),
  valueAmount: optionalDecimal,
  currency: optionalText,
  coverageDescription: optionalText,
  eligibility: optionalText,
  deadline: optionalDate,
  applicationMethod: optionalText,
  status: scholarshipStatusSchema.default("RESEARCHING"),
  notes: optionalText,
});

export const scholarshipUpdateSchema = scholarshipCreateSchema.partial().extend({
  id: idSchema,
});

export type ScholarshipCreateInput = z.infer<typeof scholarshipCreateSchema>;
export type ScholarshipUpdateInput = z.infer<typeof scholarshipUpdateSchema>;
