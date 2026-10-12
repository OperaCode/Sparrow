import { z } from "zod";

const lineSchema = z.strictObject({
  productId: z.uuid(),
  quantity: z.number().int().positive().max(99),
});

/** Product ids and quantities only. A client price or fee is rejected. */
export const quoteBodySchema = z.strictObject({
  lines: z.array(lineSchema).min(1).max(30),
});

export const orderBodySchema = z.strictObject({
  lines: z.array(lineSchema).min(1).max(30),
  destinationAddress: z.string().trim().min(1).max(200),
  destinationLandmark: z.string().trim().max(200).optional(),
  destinationContactName: z.string().trim().min(1).max(80),
  destinationContactPhone: z.string().trim().min(7).max(20),
});

export const categoryParamsSchema = z.strictObject({
  categoryId: z.uuid(),
});
