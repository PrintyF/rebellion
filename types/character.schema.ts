import { z } from "zod";
import { uniqueById } from "./unique-by-id.js";

// Dérivé des stats ci-dessous au moment du build (cf. scripts/build-data.ts) :
// conditionne l'accès aux missions correspondantes (EP14). "recruitment",
// "sabotage" et "incite-uprising" ne sont pas dérivables de la source de
// données actuelle (pas de colonne dédiée) et restent vides pour l'instant
// — cf. warning au build.
export const CharacterCapabilitySchema = z.enum([
  "recruitment",
  "espionage",
  "diplomacy",
  "sabotage",
  "incite-uprising",
  "troop-research",
  "installation-research",
  "naval-research",
]);
export type CharacterCapability = z.infer<typeof CharacterCapabilitySchema>;

export const CharacterStatusSchema = z.enum(["stationed", "moving"]);
export type CharacterStatus = z.infer<typeof CharacterStatusSchema>;

export const StatRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});
export type StatRange = z.infer<typeof StatRangeSchema>;

export const CharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  faction: z.enum(["empire", "alliance"]),
  // Placement de départ (scénario/sauvegarde), absent du roster de
  // personnages en tant que tel — cf. warning au build tant qu'aucune
  // source de scénario n'est branchée.
  containerId: z.string().min(1).nullable(),
  status: CharacterStatusSchema,
  canBetray: z.boolean(),
  canBeAdmiral: z.boolean(),
  canBeCommander: z.boolean(),
  canBeGeneral: z.boolean(),
  diplomacy: StatRangeSchema,
  espionage: StatRangeSchema,
  combat: StatRangeSchema,
  leadership: StatRangeSchema,
  research: z.object({
    ship: StatRangeSchema,
    troop: StatRangeSchema,
    facility: StatRangeSchema,
  }),
  jedi: z.object({
    probability: z.number(),
    level: StatRangeSchema,
    isKnown: z.boolean(),
    isTrainer: z.boolean(),
  }),
  capabilities: z.array(CharacterCapabilitySchema),
  description: z.string().optional(),
});
export type Character = z.infer<typeof CharacterSchema>;

export const CharacterListSchema = uniqueById(CharacterSchema, "characters.json");
