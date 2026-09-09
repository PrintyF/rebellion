import { z } from "zod";
import { uniqueById } from "./unique-by-id.js";

// Vaisseaux spatiaux uniquement (chasseurs + capitaux) — les troupes et
// forces spéciales ont leur propre fichier (troops.json, special-forces.json).
export const ShipCategorySchema = z.enum(["fighter", "capital-ship"]);
export type ShipCategory = z.infer<typeof ShipCategorySchema>;

export const ShipSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  faction: z.enum(["empire", "alliance"]),
  category: ShipCategorySchema,
  cost: z.number().nonnegative(),
  maintenanceCost: z.number().nonnegative(),
  unlockedByResearch: z.string().min(1).nullable(),
  // Chasseurs et vaisseaux capitaux ont des jeux de stats très différents
  // (armes/boucliers par arc de tir pour les capitaux, agilité/escadrille
  // pour les chasseurs) : sac générique plutôt qu'un schéma par catégorie.
  stats: z.record(z.string(), z.number()),
  description: z.string().optional(),
});
export type Ship = z.infer<typeof ShipSchema>;

export const ShipListSchema = uniqueById(ShipSchema, "ships.json");
