import { z } from "zod";

export const createCategorySchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameEl: z.string().min(1, "Greek name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  icon: z.string().optional(),
  sortOrder: z.number().int().default(0),
  parentId: z.string().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
