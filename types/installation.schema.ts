import { z } from "zod";
import { uniqueById } from "./unique-by-id.js";

export const InstallationCategorySchema = z.enum(["production", "resources", "defense"]);
export type InstallationCategory = z.infer<typeof InstallationCategorySchema>;

export const InstallationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: InstallationCategorySchema,
  cost: z.number().nonnegative(),
  maintenanceCost: z.number().nonnegative(),
  buildTimeInTurns: z.number().int().positive(),
  unlockedByResearch: z.string().min(1).nullable(),
  isStartingInstallation: z.boolean(),
  // Bombardment (= résistance au bombardement, pas une attaque),
  // Production Rate, Weapon Power, Shield Strength, Research (= ordre/
  // palier de déblocage, pas une difficulté)... varient selon la
  // catégorie (une facility de production n'a pas les mêmes stats
  // qu'une défense) — même approche que UnitSchema.stats : sac
  // générique plutôt qu'un schéma par catégorie.
  stats: z.record(z.string(), z.number()),
  description: z.string().optional(),
});
export type Installation = z.infer<typeof InstallationSchema>;

export const InstallationListSchema = uniqueById(InstallationSchema, "installations.json");
