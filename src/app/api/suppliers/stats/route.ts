import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth("SUPPLIER");
  if (error) return error;

  const supplierProfile = await prisma.supplierProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!supplierProfile) return jsonError("Supplier profile not found", 404);

  const { searchParams } = request.nextUrl;
  const days = parseInt(searchParams.get("days") || "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get order groups for this supplier within the time range
  const orderGroups = await prisma.orderGroup.findMany({
    where: {
      supplierId: supplierProfile.id,
      createdAt: { gte: since },
    },
    include: {
      items: {
        include: {
          product: { select: { id: true, title: true, images: true } },
        },
      },
      order: {
        include: {
          buyer: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats
  const totalRevenue = orderGroups.reduce(
    (sum, og) => sum + parseFloat(og.subtotal.toString()),
    0
  );
  const activeOrders = orderGroups.filter(
    (og) => og.status !== "DELIVERED" && og.status !== "CANCELLED"
  ).length;

  // Unique buyers
  const uniqueBuyerIds = new Set(orderGroups.map((og) => og.order.buyerId));
  const newCustomers = uniqueBuyerIds.size;

  const avgOrderValue = orderGroups.length > 0 ? totalRevenue / orderGroups.length : 0;

  // Top selling products
  const productSales: Record<string, { id: string; title: string; image: string | null; revenue: number; units: number }> = {};
  for (const og of orderGroups) {
    for (const item of og.items) {
      const key = item.productId;
      if (!productSales[key]) {
        productSales[key] = {
          id: item.productId,
          title: item.product.title,
          image: item.product.images[0] || null,
          revenue: 0,
          units: 0,
        };
      }
      productSales[key].revenue += parseFloat(item.unitPrice.toString()) * item.quantity;
      productSales[key].units += item.quantity;
    }
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Sales trend (daily revenue for the period)
  const dailyRevenue: Record<string, { revenue: number; orders: number }> = {};
  for (const og of orderGroups) {
    const day = og.createdAt.toISOString().split("T")[0];
    if (!dailyRevenue[day]) dailyRevenue[day] = { revenue: 0, orders: 0 };
    dailyRevenue[day].revenue += parseFloat(og.subtotal.toString());
    dailyRevenue[day].orders += 1;
  }
  const salesTrend = Object.entries(dailyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));

  return NextResponse.json({
    totalRevenue,
    activeOrders,
    newCustomers,
    avgOrderValue,
    topProducts,
    salesTrend,
    recentOrders: orderGroups.slice(0, 10),
  });
}
