import { z } from "zod";
import { uniqueById } from "./unique-by-id.js";

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

export const CharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  faction: z.enum(["empire", "alliance"]),
  containerId: z.string().min(1),
  status: CharacterStatusSchema,
  capabilities: z.array(CharacterCapabilitySchema),
  description: z.string().optional(),
});
export type Character = z.infer<typeof CharacterSchema>;

export const CharacterListSchema = uniqueById(CharacterSchema, "characters.json");
