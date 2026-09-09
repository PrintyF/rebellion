import { z } from "zod";
import { uniqueById } from "./unique-by-id.js";

// Ni un personnage (pas de roster fixe, doit être construit comme une
// unité), ni une troupe classique (missions limitées façon personnage,
// stats espionage/combat/leadership plutôt qu'attack/defense) — cf.
// clarification utilisateur. Les missions ne sont pas contraintes à
// CharacterCapabilitySchema : la source liste des missions plus
// granulaires (ex: "Death Star Sabotage", "Abduction") qui ne
// correspondent pas 1:1 aux capacités de personnage.
export const SpecialForceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  faction: z.enum(["empire", "alliance"]),
  missions: z.array(z.string().min(1)),
  cost: z.number().nonnegative(),
  maintenanceCost: z.number().nonnegative(),
  espionage: z.number(),
  combat: z.number(),
  leadership: z.number(),
  description: z.string().optional(),
});
export type SpecialForce = z.infer<typeof SpecialForceSchema>;

export const SpecialForceListSchema = uniqueById(SpecialForceSchema, "special-forces.json");
