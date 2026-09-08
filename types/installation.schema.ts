import { z } from "zod";
import { uniqueById } from "./unique-by-id.js";

export const InstallationCategorySchema = z.enum(["production", "resources", "defense"]);
export type InstallationCategory = z.infer<typeof InstallationCategorySchema>;

export const InstallationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: InstallationCategorySchema,
  cost: z.number().nonnegative(),
  buildTimeInTurns: z.number().int().positive(),
  unlockedByResearch: z.string().min(1).nullable(),
  isStartingInstallation: z.boolean(),
  description: z.string().optional(),
});
export type Installation = z.infer<typeof InstallationSchema>;

export const InstallationListSchema = uniqueById(InstallationSchema, "installations.json");
