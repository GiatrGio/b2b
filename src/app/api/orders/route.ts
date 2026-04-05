import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonError } from "@/lib/api-utils";
import { placeOrderSchema } from "@/lib/validations/order";

export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const user = session!.user;

  if (user.role === "BUYER") {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { buyerId: user.id },
        include: {
          orderGroups: {
            include: {
              supplier: { select: { id: true, businessName: true, logo: true } },
              items: {
                include: {
                  product: { select: { id: true, title: true, images: true } },
                  variant: { select: { id: true, label: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { buyerId: user.id } }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  if (user.role === "SUPPLIER") {
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: user.id },
    });
    if (!supplierProfile) return jsonError("Supplier profile not found", 404);

    const [orderGroups, total] = await Promise.all([
      prisma.orderGroup.findMany({
        where: { supplierId: supplierProfile.id },
        include: {
          order: {
            include: {
              buyer: { select: { id: true, name: true, email: true } },
            },
          },
          items: {
            include: {
              product: { select: { id: true, title: true, images: true } },
              variant: { select: { id: true, label: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.orderGroup.count({ where: { supplierId: supplierProfile.id } }),
    ]);

    return NextResponse.json({
      orderGroups,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  return jsonError("Forbidden", 403);
}

export async function POST(request: Request) {
  const { error, session } = await requireAuth("BUYER");
  if (error) return error;

  const body = await request.json();
  const parsed = placeOrderSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400);
  }

  const { items, deliveryAddress, deliveryCity, deliveryRegion, deliveryPostalCode, notes } = parsed.data;

  // Fetch all variants with their products and suppliers
  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        include: { supplier: { select: { id: true, businessName: true } } },
      },
    },
  });

  // Validate all variants exist and have enough stock
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) return jsonError(`Variant ${item.variantId} not found`, 400);
    if (variant.stock < item.quantity) {
      return jsonError(`Insufficient stock for ${variant.label}`, 400);
    }
    if (variant.productId !== item.productId) {
      return jsonError(`Variant ${item.variantId} does not belong to product ${item.productId}`, 400);
    }
  }

  // Group items by supplier
  const groupedBySupplier: Record<string, typeof items> = {};
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId)!;
    const supplierId = variant.product.supplier.id;
    if (!groupedBySupplier[supplierId]) groupedBySupplier[supplierId] = [];
    groupedBySupplier[supplierId].push(item);
  }

  // Create order with groups in a transaction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = await prisma.$transaction(async (tx: any) => {
    // Calculate total
    let totalAmount = 0;
    const groupsData: Array<{
      supplierId: string;
      subtotal: number;
      items: Array<{ productId: string; variantId: string; quantity: number; unitPrice: number }>;
    }> = [];

    for (const [supplierId, groupItems] of Object.entries(groupedBySupplier)) {
      let subtotal = 0;
      const orderItems: Array<{
        productId: string;
        variantId: string;
        quantity: number;
        unitPrice: number;
      }> = [];

      for (const item of groupItems) {
        const variant = variants.find((v) => v.id === item.variantId)!;
        const unitPrice = parseFloat(variant.price.toString());
        subtotal += unitPrice * item.quantity;
        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice,
        });
      }

      totalAmount += subtotal;
      groupsData.push({ supplierId, subtotal, items: orderItems });
    }

    // Create the order
    const newOrder = await tx.order.create({
      data: {
        buyerId: session!.user.id,
        totalAmount,
        deliveryAddress,
        deliveryCity,
        deliveryRegion,
        deliveryPostalCode,
        notes,
        orderGroups: {
          create: groupsData.map((group) => ({
            supplierId: group.supplierId,
            subtotal: group.subtotal,
            items: {
              create: group.items,
            },
          })),
        },
      },
      include: {
        orderGroups: {
          include: {
            items: true,
            supplier: { select: { id: true, businessName: true } },
          },
        },
      },
    });

    // Decrement stock for all variants
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  return NextResponse.json(order, { status: 201 });
}
