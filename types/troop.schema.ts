import { z } from "zod";
import { uniqueById } from "./unique-by-id.js";

export const TroopSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  faction: z.enum(["empire", "alliance"]),
  cost: z.number().nonnegative(),
  maintenanceCost: z.number().nonnegative(),
  unlockedByResearch: z.string().min(1).nullable(),
  // attackRating, defenseRating, bombDefense, detectionRating.
  stats: z.record(z.string(), z.number()),
  description: z.string().optional(),
});
export type Troop = z.infer<typeof TroopSchema>;

export const TroopListSchema = uniqueById(TroopSchema, "troops.json");
