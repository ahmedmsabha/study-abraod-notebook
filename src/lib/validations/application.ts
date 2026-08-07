import { z } from "zod";
import {
  booleanField,
  idSchema,
  optionalDate,
  optionalText,
  optionalUrl,
} from "./common";
import { applicationStatusSchema } from "./enums";

export const applicationCreateSchema = z.object({
  programId: idSchema,
  status: applicationStatusSchema.default("RESEARCHING"),
  submittedAt: optionalDate,
  decisionDate: optionalDate,
  applicationPortalUrl: optionalUrl,
  applicationReferenceNumber: optionalText,
  feePaid: booleanField.default(false),
  notes: optionalText,
});

export const applicationUpdateSchema = applicationCreateSchema.partial().extend({
  id: idSchema,
});

export const applicationStatusOnlySchema = z.object({
  id: idSchema,
  status: applicationStatusSchema,
});

export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
