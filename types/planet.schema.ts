import { z } from "zod";
import { uniqueById } from "./unique-by-id.js";

export const FactionSchema = z.enum(["empire", "alliance"]);
export type Faction = z.infer<typeof FactionSchema>;

export const GarrisonEntrySchema = z.object({
  unitId: z.string().min(1),
  quantity: z.number().int().nonnegative(),
});
export type GarrisonEntry = z.infer<typeof GarrisonEntrySchema>;

export const PlanetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sectorId: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }),
  loyalty: z.object({
    empire: z.number().min(0).max(100),
    alliance: z.number().min(0).max(100),
  }),
  garrison: z.array(GarrisonEntrySchema),
  description: z.string().optional(),
});
export type Planet = z.infer<typeof PlanetSchema>;

export const PlanetListSchema = uniqueById(PlanetSchema, "planets.json");
