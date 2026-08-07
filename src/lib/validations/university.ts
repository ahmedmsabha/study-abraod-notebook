import { z } from "zod";
import {
  idSchema,
  optionalId,
  optionalText,
  optionalUrl,
  requiredName,
} from "./common";
import { prioritySchema, universityStatusSchema } from "./enums";

export const universityCreateSchema = z.object({
  countryId: idSchema,
  cityId: optionalId,
  name: requiredName,
  officialWebsite: optionalUrl,
  facultyOrDepartment: optionalText,
  universityRankingNotes: optionalText,
  tuitionNotes: optionalText,
  applicationPortalUrl: optionalUrl,
  internationalOfficeUrl: optionalUrl,
  notes: optionalText,
  status: universityStatusSchema.default("RESEARCHING"),
  priority: prioritySchema.default("MEDIUM"),
});

export const universityUpdateSchema = universityCreateSchema.partial().extend({
  id: idSchema,
});

export type UniversityCreateInput = z.infer<typeof universityCreateSchema>;
export type UniversityUpdateInput = z.infer<typeof universityUpdateSchema>;
