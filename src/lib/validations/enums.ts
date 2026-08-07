import { z } from "zod";
import {
  AcceptingStudents,
  ApplicationStatus,
  ContactChannel,
  ContactStatus,
  DegreeType,
  FundingType,
  PlaceCategory,
  Priority,
  ProgramMode,
  RequirementCategory,
  ScholarshipStatus,
  TaskPriority,
  TaskStatus,
  UniversityStatus,
} from "../../../generated/prisma/enums";

function enumValues<T extends Record<string, string>>(obj: T) {
  return Object.values(obj) as [T[keyof T], ...T[keyof T][]];
}

export const universityStatusSchema = z.enum(enumValues(UniversityStatus));
export const prioritySchema = z.enum(enumValues(Priority));
export const degreeTypeSchema = z.enum(enumValues(DegreeType));
export const programModeSchema = z.enum(enumValues(ProgramMode));
export const acceptingStudentsSchema = z.enum(enumValues(AcceptingStudents));
export const contactStatusSchema = z.enum(enumValues(ContactStatus));
export const fundingTypeSchema = z.enum(enumValues(FundingType));
export const scholarshipStatusSchema = z.enum(enumValues(ScholarshipStatus));
export const requirementCategorySchema = z.enum(enumValues(RequirementCategory));
export const applicationStatusSchema = z.enum(enumValues(ApplicationStatus));
export const taskStatusSchema = z.enum(enumValues(TaskStatus));
export const taskPrioritySchema = z.enum(enumValues(TaskPriority));
export const contactChannelSchema = z.enum(enumValues(ContactChannel));
export const placeCategorySchema = z.enum(enumValues(PlaceCategory));
