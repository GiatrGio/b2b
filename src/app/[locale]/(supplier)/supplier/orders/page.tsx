import { useTranslations } from "next-intl";

export default function SupplierOrdersPage() {
  const t = useTranslations("supplier.orders");

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>

      <div className="bg-surface-lowest rounded-xl shadow-aegean overflow-hidden">
        <div className="p-8 text-center text-on-surface-variant">
          <p>No orders yet. Orders will appear here when buyers purchase your products.</p>
        </div>
      </div>
    </div>
  );
}
