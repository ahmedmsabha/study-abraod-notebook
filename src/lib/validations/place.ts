import { z } from "zod";
import {
  idSchema,
  optionalRating,
  optionalText,
  optionalUrl,
  requiredName,
} from "./common";
import { placeCategorySchema } from "./enums";

export const placeCreateSchema = z.object({
  cityId: idSchema,
  name: requiredName,
  category: placeCategorySchema.default("OTHER"),
  mapUrl: optionalUrl,
  websiteUrl: optionalUrl,
  priceLevel: optionalText,
  notes: optionalText,
  rating: optionalRating,
});

export const placeUpdateSchema = placeCreateSchema.partial().extend({
  id: idSchema,
});

export type PlaceCreateInput = z.infer<typeof placeCreateSchema>;
export type PlaceUpdateInput = z.infer<typeof placeUpdateSchema>;
