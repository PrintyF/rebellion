import { z } from "zod";
import { uniqueById } from "./unique-by-id.js";

export const SectorTypeSchema = z.enum(["outer-rim", "inner-rim"]);
export type SectorType = z.infer<typeof SectorTypeSchema>;

export const SectorSizeSchema = z.enum(["standard", "large", "huge"]);
export type SectorSize = z.infer<typeof SectorSizeSchema>;

export const SectorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: SectorTypeSchema,
  size: SectorSizeSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  systemIds: z.array(z.string().min(1)),
  adjacentSectorIds: z.array(z.string().min(1)),
});
export type Sector = z.infer<typeof SectorSchema>;

export const SectorListSchema = uniqueById(SectorSchema, "sectors.json");
