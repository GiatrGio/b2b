import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonError } from "@/lib/api-utils";
import { updateProductSchema } from "@/lib/validations/product";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { where: { isActive: true }, orderBy: { price: "asc" } },
      category: true,
      supplier: {
        select: {
          id: true,
          businessName: true,
          logo: true,
          description: true,
          city: true,
          region: true,
        },
      },
      reviews: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { reviews: true, favorites: true } },
    },
  });

  if (!product) {
    return jsonError("Product not found", 404);
  }

  // Calculate average rating
  const avgRating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : null;

  return NextResponse.json({ ...product, avgRating });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth("SUPPLIER");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400);
  }

  // Verify ownership
  const product = await prisma.product.findUnique({
    where: { id },
    include: { supplier: true },
  });
  if (!product) return jsonError("Product not found", 404);
  if (product.supplier.userId !== session!.user.id) {
    return jsonError("Forbidden", 403);
  }

  const { variants, ...productData } = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { ...productData };

  if (variants) {
    // Upsert variants: update existing, create new, deactivate removed
    const existingIds = variants.filter((v) => v.id).map((v) => v.id!);

    // Deactivate variants not in the update
    await prisma.productVariant.updateMany({
      where: { productId: id, id: { notIn: existingIds } },
      data: { isActive: false },
    });

    // Upsert each variant
    for (const variant of variants) {
      if (variant.id) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            label: variant.label,
            labelEl: variant.labelEl,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            isActive: variant.isActive,
          },
        });
      } else {
        await prisma.productVariant.create({
          data: { ...variant, productId: id },
        });
      }
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { variants: { where: { isActive: true } }, category: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth("SUPPLIER");
  if (error) return error;

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { supplier: true },
  });
  if (!product) return jsonError("Product not found", 404);
  if (product.supplier.userId !== session!.user.id) {
    return jsonError("Forbidden", 403);
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
