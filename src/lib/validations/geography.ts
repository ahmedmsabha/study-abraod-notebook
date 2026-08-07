import { z } from "zod";
import {
  countryCode,
  idSchema,
  optionalText,
  requiredName,
} from "./common";

export const countryCreateSchema = z.object({
  name: requiredName,
  code: countryCode,
  region: optionalText,
  currency: optionalText,
  languageNotes: optionalText,
  visaNotes: optionalText,
  costOfLivingNotes: optionalText,
  safetyNotes: optionalText,
  generalNotes: optionalText,
});

export const countryUpdateSchema = countryCreateSchema.partial().extend({
  id: idSchema,
});

export const cityCreateSchema = z.object({
  countryId: idSchema,
  name: requiredName,
  costOfLivingEstimate: optionalText,
  housingNotes: optionalText,
  transportNotes: optionalText,
  weatherNotes: optionalText,
  safetyNotes: optionalText,
});

export const cityUpdateSchema = cityCreateSchema.partial().extend({
  id: idSchema,
});

export type CountryCreateInput = z.infer<typeof countryCreateSchema>;
export type CountryUpdateInput = z.infer<typeof countryUpdateSchema>;
export type CityCreateInput = z.infer<typeof cityCreateSchema>;
export type CityUpdateInput = z.infer<typeof cityUpdateSchema>;
