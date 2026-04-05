import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonError } from "@/lib/api-utils";
import { z } from "zod";

const toggleFavoriteSchema = z.object({
  targetType: z.enum(["PRODUCT", "SUPPLIER"]),
  productId: z.string().optional(),
  supplierId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth("BUYER");
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const targetType = searchParams.get("targetType");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId: session!.user.id };
  if (targetType === "PRODUCT" || targetType === "SUPPLIER") {
    where.targetType = targetType;
  }

  const favorites = await prisma.favorite.findMany({
    where,
    include: {
      product: {
        include: {
          variants: { where: { isActive: true }, orderBy: { price: "asc" }, take: 1 },
          supplier: { select: { id: true, businessName: true } },
          _count: { select: { reviews: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

// Toggle favorite (add/remove)
export async function POST(request: Request) {
  const { error, session } = await requireAuth("BUYER");
  if (error) return error;

  const body = await request.json();
  const parsed = toggleFavoriteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400);
  }

  const { targetType, productId, supplierId } = parsed.data;
  const userId = session!.user.id;

  // Check if already favorited
  const existing = await prisma.favorite.findFirst({
    where: {
      userId,
      targetType,
      ...(targetType === "PRODUCT" ? { productId } : { supplierId }),
    },
  });

  if (existing) {
    // Remove favorite
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  // Add favorite
  await prisma.favorite.create({
    data: {
      userId,
      targetType,
      productId: targetType === "PRODUCT" ? productId : null,
      supplierId: targetType === "SUPPLIER" ? supplierId : null,
    },
  });

  return NextResponse.json({ favorited: true }, { status: 201 });
}
