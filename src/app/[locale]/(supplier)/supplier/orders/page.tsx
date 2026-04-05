"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  product: { id: string; title: string; images: string[] };
  variant: { id: string; label: string };
}

interface OrderGroup {
  id: string;
  status: string;
  subtotal: string;
  createdAt: string;
  order: {
    id: string;
    deliveryAddress: string | null;
    deliveryCity: string | null;
    buyer: { id: string; name: string | null; email: string };
  };
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-aegean-50 text-aegean",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const nextStatus: Record<string, string> = {
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export default function SupplierOrdersPage() {
  const t = useTranslations("supplier.orders");
  const tc = useTranslations("common");
  const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrderGroups(data.orderGroups || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderGroupId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderGroupId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      toast.success(`Order updated to ${status}`);
      fetchOrders();
    } else {
      toast.error("Failed to update order status");
    }
  };

  if (loading) {
    return <p className="text-on-surface-variant">{tc("loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>

      {orderGroups.length === 0 ? (
        <div className="bg-surface-lowest rounded-xl p-8 text-center shadow-aegean">
          <p className="text-on-surface-variant">
            No orders yet. Orders will appear here when buyers purchase your
            products.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderGroups.map((group) => (
            <div
              key={group.id}
              className="bg-surface-lowest rounded-xl shadow-aegean overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-3 bg-surface-low flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono font-medium text-aegean">
                    #{group.order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                  <Badge
                    className={`${
                      statusColors[group.status] || "bg-gray-100"
                    } border-0 text-xs`}
                  >
                    {group.status}
                  </Badge>
                </div>
                <span className="font-semibold">
                  &euro;{parseFloat(group.subtotal).toFixed(2)}
                </span>
              </div>

              {/* Buyer info */}
              <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-border">
                <div>
                  <span className="text-sm font-medium">
                    {group.order.buyer.name || "Unknown Buyer"}
                  </span>
                  <span className="text-xs text-on-surface-variant ml-2">
                    {group.order.buyer.email}
                  </span>
                </div>
                {group.order.deliveryAddress && (
                  <span className="text-xs text-on-surface-variant">
                    {group.order.deliveryAddress}
                    {group.order.deliveryCity && `, ${group.order.deliveryCity}`}
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="px-5 py-3 space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-1"
                  >
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.title}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-surface-high rounded-lg" />
                    )}
                    <div className="flex-1">
                      <span className="text-sm">{item.product.title}</span>
                      <span className="text-xs text-on-surface-variant ml-2">
                        ({item.variant.label})
                      </span>
                    </div>
                    <span className="text-sm text-on-surface-variant">
                      x{item.quantity}
                    </span>
                    <span className="text-sm font-medium">
                      &euro;
                      {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {nextStatus[group.status] && (
                <div className="px-5 py-3 bg-surface-low flex justify-end">
                  <button
                    onClick={() =>
                      updateStatus(group.id, nextStatus[group.status])
                    }
                    className="px-4 py-2 text-sm font-semibold text-white btn-gradient rounded-lg"
                  >
                    Mark as {nextStatus[group.status]}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
