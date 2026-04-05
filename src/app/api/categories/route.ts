import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonError } from "@/lib/api-utils";
import { createCategorySchema } from "@/lib/validations/category";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId");
  const flat = searchParams.get("flat");

  if (flat === "true") {
    // Return all categories flat (for product assignment dropdowns)
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { parent: true },
    });
    return NextResponse.json(categories);
  }

  if (parentId) {
    // Return subcategories of a specific parent
    const categories = await prisma.category.findMany({
      where: { parentId },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
  }

  // Default: return main categories with their children
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      children: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const { error, session } = await requireAuth("ADMIN");
  if (error) return error;

  const body = await request.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400);
  }

  const existing = await prisma.category.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return jsonError("Category with this slug already exists", 409);
  }

  const category = await prisma.category.create({ data: parsed.data });
  return NextResponse.json(category, { status: 201 });
}
