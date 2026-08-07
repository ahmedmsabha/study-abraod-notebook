import { z } from "zod";
import {
  idSchema,
  optionalDate,
  optionalId,
  optionalText,
  requiredName,
} from "./common";
import { taskPrioritySchema, taskStatusSchema } from "./enums";

export const taskCreateSchema = z.object({
  title: requiredName,
  description: optionalText,
  dueDate: optionalDate,
  status: taskStatusSchema.default("TODO"),
  priority: taskPrioritySchema.default("MEDIUM"),
  relatedUniversityId: optionalId,
  relatedProgramId: optionalId,
  relatedScholarshipId: optionalId,
  relatedProfessorId: optionalId,
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  id: idSchema,
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
