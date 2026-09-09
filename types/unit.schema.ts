import { z } from "zod";
import { uniqueById } from "./unique-by-id.js";

export const UnitCategorySchema = z.enum(["troop", "fighter", "capital-ship"]);
export type UnitCategory = z.infer<typeof UnitCategorySchema>;

export const UnitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  faction: z.enum(["empire", "alliance"]),
  category: UnitCategorySchema,
  cost: z.number().nonnegative(),
  maintenanceCost: z.number().nonnegative(),
  unlockedByResearch: z.string().min(1).nullable(),
  // Vaisseaux, chasseurs et troupes ont des jeux de stats très différents
  // (armes/boucliers pour les capitaux, rien de tout ça pour les troupes) :
  // on garde les stats brutes issues du CSV sous forme de sac générique
  // plutôt que de figer un schéma par catégorie.
  stats: z.record(z.string(), z.number()),
  description: z.string().optional(),
});
export type Unit = z.infer<typeof UnitSchema>;

export const UnitListSchema = uniqueById(UnitSchema, "units.json");
