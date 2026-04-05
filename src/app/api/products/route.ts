import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonError } from "@/lib/api-utils";
import { createProductSchema } from "@/lib/validations/product";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categoryId = searchParams.get("categoryId");
  const supplierId = searchParams.get("supplierId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const parentCategoryId = searchParams.get("parentCategoryId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isActive: true };

  if (categoryId) {
    where.categoryId = categoryId;
  } else if (parentCategoryId) {
    // Get all products under a main category (across all its subcategories)
    const subcategories = await prisma.category.findMany({
      where: { parentId: parentCategoryId },
      select: { id: true },
    });
    const subcategoryIds = subcategories.map((c) => c.id);
    where.categoryId = { in: subcategoryIds };
  }
  if (supplierId) where.supplierId = supplierId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: { where: { isActive: true }, orderBy: { price: "asc" } },
        category: true,
        supplier: { select: { id: true, businessName: true, logo: true } },
        _count: { select: { reviews: true, favorites: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  const { error, session } = await requireAuth("SUPPLIER");
  if (error) return error;

  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400);
  }

  const supplierProfile = await prisma.supplierProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!supplierProfile) {
    return jsonError("Supplier profile not found", 404);
  }

  const { variants, ...productData } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...productData,
      supplierId: supplierProfile.id,
      variants: {
        create: variants,
      },
    },
    include: {
      variants: true,
      category: true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
