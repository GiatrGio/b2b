"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/stores/cart-store";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const router = useRouter();
  const { items, getTotal, getGroupedBySupplier, clearCart } = useCartStore();
  const grouped = getGroupedBySupplier();
  const total = getTotal();

  const [form, setForm] = useState({
    deliveryAddress: "",
    deliveryCity: "",
    deliveryRegion: "",
    deliveryPostalCode: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          ...form,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || tc("error"));
        setLoading(false);
        return;
      }

      clearCart();
      toast.success(t("orderPlaced"));
      router.push("/orders");
    } catch {
      toast.error(tc("error"));
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order summary */}
        <div className="bg-surface-lowest rounded-xl shadow-aegean p-5">
          <h2 className="font-heading font-semibold text-lg mb-4">
            {t("orderSummary")}
          </h2>
          {Object.entries(grouped).map(([supplierId, supplierItems]) => (
            <div key={supplierId} className="mb-4 last:mb-0">
              <p className="text-sm font-medium text-on-surface-variant mb-2">
                {supplierItems.length} {t("itemsFromSupplier")}{" "}
                <span className="text-on-surface">
                  {supplierItems[0].supplierName}
                </span>
              </p>
              {supplierItems.map((item) => (
                <div
                  key={item.variantId}
                  className="flex justify-between text-sm py-1"
                >
                  <span>
                    {item.productTitle} ({item.variantLabel}) x{item.quantity}
                  </span>
                  <span className="font-medium">
                    &euro;{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ))}
          <div className="border-t border-border mt-4 pt-4 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-aegean">&euro;{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery address */}
        <div className="bg-surface-lowest rounded-xl shadow-aegean p-5 space-y-4">
          <h2 className="font-heading font-semibold text-lg">
            {t("deliveryAddress")}
          </h2>
          <div className="space-y-2">
            <Label>{t("address")}</Label>
            <Input
              value={form.deliveryAddress}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, deliveryAddress: e.target.value }))
              }
              required
              className="bg-surface-high ghost-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("city")}</Label>
              <Input
                value={form.deliveryCity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deliveryCity: e.target.value }))
                }
                required
                className="bg-surface-high ghost-border"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("region")}</Label>
              <Input
                value={form.deliveryRegion}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    deliveryRegion: e.target.value,
                  }))
                }
                className="bg-surface-high ghost-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("postalCode")}</Label>
            <Input
              value={form.deliveryPostalCode}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  deliveryPostalCode: e.target.value,
                }))
              }
              className="bg-surface-high ghost-border max-w-xs"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("orderNotes")}</Label>
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="bg-surface-high ghost-border"
              rows={3}
              placeholder="Special delivery instructions..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-base font-semibold text-white btn-gradient rounded-xl disabled:opacity-50"
        >
          {loading ? tc("loading") : t("placeOrder")}
        </button>
      </form>
    </div>
  );
}
