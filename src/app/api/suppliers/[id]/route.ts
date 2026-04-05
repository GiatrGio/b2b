import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supplier = await prisma.supplierProfile.findUnique({
    where: { id },
    include: {
      products: {
        where: { isActive: true },
        include: {
          variants: { where: { isActive: true }, orderBy: { price: "asc" } },
          category: true,
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        where: { targetType: "SUPPLIER" },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { products: true, reviews: true, orderGroups: true } },
    },
  });

  if (!supplier) return jsonError("Supplier not found", 404);

  const avgRating = await prisma.review.aggregate({
    where: { supplierId: id, targetType: "SUPPLIER" },
    _avg: { rating: true },
  });

  // Get unique categories from supplier's products
  const categories = await prisma.category.findMany({
    where: { products: { some: { supplierId: id, isActive: true } } },
  });

  return NextResponse.json({
    ...supplier,
    avgRating: avgRating._avg.rating,
    categories,
  });
}
