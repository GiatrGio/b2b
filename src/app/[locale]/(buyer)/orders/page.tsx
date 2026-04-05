"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

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
  supplier: { id: string; businessName: string };
  items: OrderItem[];
}

interface Order {
  id: string;
  status: string;
  totalAmount: string;
  deliveryAddress: string | null;
  createdAt: string;
  orderGroups: OrderGroup[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-aegean-50 text-aegean",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const t = useTranslations("buyer.orders");
  const tc = useTranslations("common");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-on-surface-variant">{tc("loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
      <p className="text-on-surface-variant">{t("subtitle")}</p>

      {orders.length === 0 ? (
        <div className="bg-surface-lowest rounded-xl p-8 text-center shadow-aegean">
          <p className="text-on-surface-variant">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-surface-lowest rounded-xl shadow-aegean overflow-hidden"
            >
              <div className="px-5 py-3 bg-surface-low flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono font-medium text-aegean">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-semibold">
                  &euro;{parseFloat(order.totalAmount).toFixed(2)}
                </span>
              </div>

              <div className="p-5 space-y-4">
                {order.orderGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {group.supplier.businessName}
                      </span>
                      <Badge
                        className={`${
                          statusColors[group.status] || "bg-gray-100"
                        } border-0 text-xs`}
                      >
                        {t(group.status.toLowerCase() as "pending" | "confirmed" | "shipped" | "delivered" | "cancelled")}
                      </Badge>
                    </div>
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm text-on-surface-variant pl-4"
                      >
                        <span>
                          {item.product.title} ({item.variant.label}) x
                          {item.quantity}
                        </span>
                        <span>
                          &euro;
                          {(
                            parseFloat(item.unitPrice) * item.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
