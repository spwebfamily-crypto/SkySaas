import { z } from "zod";

export const searchRequestSchema = z.object({
  origin: z
    .string()
    .trim()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase()),
  destination: z
    .string()
    .trim()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase()),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  adults: z.coerce.number().int().min(1).max(9).default(1),
  cabin: z
    .enum(["economy", "premium_economy", "business", "first"])
    .default("economy"),
  mode: z.enum(["cash", "miles"]).default("cash"),
  sort: z.enum(["recommended", "price", "duration"]).default("recommended"),
});
