import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (search) {
    where.businessName = { contains: search, mode: "insensitive" };
  }

  const [suppliers, total] = await Promise.all([
    prisma.supplierProfile.findMany({
      where,
      include: {
        _count: { select: { products: true, reviews: true, orderGroups: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.supplierProfile.count({ where }),
  ]);

  // Get average ratings for each supplier
  const suppliersWithRatings = await Promise.all(
    suppliers.map(async (supplier) => {
      const avgResult = await prisma.review.aggregate({
        where: { supplierId: supplier.id, targetType: "SUPPLIER" },
        _avg: { rating: true },
      });
      return {
        ...supplier,
        avgRating: avgResult._avg.rating,
      };
    })
  );

  return NextResponse.json({
    suppliers: suppliersWithRatings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
