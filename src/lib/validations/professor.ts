import { z } from "zod";
import {
  idSchema,
  optionalDate,
  optionalEmail,
  optionalScore,
  optionalText,
  optionalUrl,
  requiredName,
  stringList,
} from "./common";
import {
  acceptingStudentsSchema,
  contactChannelSchema,
  contactStatusSchema,
} from "./enums";

export const professorCreateSchema = z.object({
  universityId: idSchema,
  fullName: requiredName,
  title: optionalText,
  department: optionalText,
  generalSpecialization: optionalText,
  researchSpecializations: stringList.default([]),
  researchKeywords: stringList.default([]),
  officialProfileUrl: optionalUrl,
  labUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  googleScholarUrl: optionalUrl,
  personalWebsiteUrl: optionalUrl,
  email: optionalEmail,
  acceptingStudents: acceptingStudentsSchema.default("UNKNOWN"),
  lastVerifiedAt: optionalDate,
  fitScore: optionalScore,
  fitReason: optionalText,
  contactStatus: contactStatusSchema.default("NOT_CONTACTED"),
  notes: optionalText,
  programIds: stringList.optional(),
});

export const professorUpdateSchema = professorCreateSchema.partial().extend({
  id: idSchema,
});

export const contactLogCreateSchema = z.object({
  professorId: idSchema,
  date: optionalDate,
  channel: contactChannelSchema.default("EMAIL"),
  subject: optionalText,
  messageSummary: optionalText,
  outcome: optionalText,
  followUpDate: optionalDate,
});

export const contactLogUpdateSchema = contactLogCreateSchema.partial().extend({
  id: idSchema,
});

export type ProfessorCreateInput = z.infer<typeof professorCreateSchema>;
export type ProfessorUpdateInput = z.infer<typeof professorUpdateSchema>;
export type ContactLogCreateInput = z.infer<typeof contactLogCreateSchema>;
export type ContactLogUpdateInput = z.infer<typeof contactLogUpdateSchema>;
