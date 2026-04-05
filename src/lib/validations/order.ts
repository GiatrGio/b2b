import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const placeOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryCity: z.string().min(1, "City is required"),
  deliveryRegion: z.string().optional(),
  deliveryPostalCode: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOrderGroupStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type UpdateOrderGroupStatusInput = z.infer<typeof updateOrderGroupStatusSchema>;
