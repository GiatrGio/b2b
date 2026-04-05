import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Label is required"),
  labelEl: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  isActive: z.boolean().default(true),
});

export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleEl: z.string().optional(),
  description: z.string().optional(),
  descriptionEl: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).default([]),
  video: z.string().optional(),
  isActive: z.boolean().default(true),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
});

export const updateProductSchema = createProductSchema.partial().extend({
  variants: z.array(productVariantSchema).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
