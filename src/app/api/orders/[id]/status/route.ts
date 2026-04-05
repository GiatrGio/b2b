import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonError } from "@/lib/api-utils";
import { updateOrderGroupStatusSchema } from "@/lib/validations/order";

// Update order group status (supplier updates their sub-order)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth("SUPPLIER");
  if (error) return error;

  const { id: orderGroupId } = await params;
  const body = await request.json();
  const parsed = updateOrderGroupStatusSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid input", 400);
  }

  // Verify ownership
  const supplierProfile = await prisma.supplierProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!supplierProfile) return jsonError("Supplier profile not found", 404);

  const orderGroup = await prisma.orderGroup.findUnique({
    where: { id: orderGroupId },
  });
  if (!orderGroup) return jsonError("Order group not found", 404);
  if (orderGroup.supplierId !== supplierProfile.id) {
    return jsonError("Forbidden", 403);
  }

  const updated = await prisma.orderGroup.update({
    where: { id: orderGroupId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}
