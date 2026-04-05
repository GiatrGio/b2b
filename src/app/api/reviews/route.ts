import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonError } from "@/lib/api-utils";
import { z } from "zod";

const createReviewSchema = z.object({
  targetType: z.enum(["PRODUCT", "SUPPLIER"]),
  productId: z.string().optional(),
  supplierId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const productId = searchParams.get("productId");
  const supplierId = searchParams.get("supplierId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (productId) {
    where.productId = productId;
    where.targetType = "PRODUCT";
  }
  if (supplierId) {
    where.supplierId = supplierId;
    where.targetType = "SUPPLIER";
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({
    reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  const { error, session } = await requireAuth("BUYER");
  if (error) return error;

  const body = await request.json();
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400);
  }

  const { targetType, productId, supplierId, rating, comment } = parsed.data;

  if (targetType === "PRODUCT" && !productId) {
    return jsonError("productId required for product review", 400);
  }
  if (targetType === "SUPPLIER" && !supplierId) {
    return jsonError("supplierId required for supplier review", 400);
  }

  // Check for duplicate review
  const existing = await prisma.review.findFirst({
    where: {
      authorId: session!.user.id,
      targetType,
      ...(productId ? { productId } : { supplierId }),
    },
  });
  if (existing) {
    return jsonError("You already reviewed this", 409);
  }

  const review = await prisma.review.create({
    data: {
      authorId: session!.user.id,
      targetType,
      productId: targetType === "PRODUCT" ? productId : null,
      supplierId: targetType === "SUPPLIER" ? supplierId : null,
      rating,
      comment,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(review, { status: 201 });
}
