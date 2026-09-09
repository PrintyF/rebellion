import { z } from "zod";

/**
 * Applies the "unique id within this entity list" rule shared by every
 * schema in types/ (sectors, planets, characters, units, installations).
 */
export function uniqueById<T extends z.ZodTypeAny>(itemSchema: T, fileName: string) {
  return z.array(itemSchema).superRefine((items, ctx) => {
    const seen = new Map<string, number>();
    items.forEach((item, index) => {
      const id = (item as { id: string }).id;
      const firstIndex = seen.get(id);
      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fileName}: identifiant en doublon "${id}" (entrées ${firstIndex} et ${index})`,
          path: [index, "id"],
        });
      } else {
        seen.set(id, index);
      }
    });
  });
}
