"use client";

import { useTranslations } from "next-intl";
import { useCartStore } from "@/stores/cart-store";
import { Link } from "@/i18n/routing";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export default function CartPage() {
  const t = useTranslations();
  const { items, updateQuantity, removeItem, getTotal, getGroupedBySupplier } =
    useCartStore();

  const grouped = getGroupedBySupplier();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold">{t("nav.cart")}</h1>
        <div className="bg-surface-lowest rounded-xl p-12 text-center shadow-aegean">
          <p className="text-on-surface-variant text-lg">Your cart is empty</p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 text-sm font-semibold text-white btn-gradient rounded-xl"
          >
            {t("nav.marketplace")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">{t("nav.cart")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(grouped).map(([supplierId, supplierItems]) => (
            <div
              key={supplierId}
              className="bg-surface-lowest rounded-xl shadow-aegean overflow-hidden"
            >
              <div className="px-5 py-3 bg-surface-low">
                <h3 className="font-semibold text-sm">
                  {supplierItems[0].supplierName}
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {supplierItems.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-4">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productTitle}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-surface-high rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.productTitle}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {item.variantLabel}
                      </p>
                      <p className="text-sm font-semibold text-aegean mt-1">
                        &euro;{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="p-1 rounded hover:bg-surface-low"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="p-1 rounded hover:bg-surface-low"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        &euro;{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="mt-1 p-1 rounded hover:bg-red-50 text-on-surface-variant hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface-lowest rounded-xl shadow-aegean p-5 sticky top-20">
            <h3 className="font-heading font-semibold text-lg mb-4">
              {t("buyer.order.orderSummary")}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">
                  {t("buyer.order.subtotal")}
                </span>
                <span className="font-medium">
                  &euro;{total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">
                  {t("buyer.order.shipping")}
                </span>
                <span className="font-medium">&euro;0.00</span>
              </div>
              <div className="border-t border-border my-3" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">{t("buyer.order.total")}</span>
                <span className="font-bold text-aegean">
                  &euro;{total.toFixed(2)}
                </span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full mt-5 py-3 text-center text-sm font-semibold text-white btn-gradient rounded-xl"
            >
              {t("buyer.order.reviewOrder")} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
