import { useTranslations } from "next-intl";

export default function InventoryPage() {
  const t = useTranslations("supplier.inventory");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
          <p className="text-on-surface-variant mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2.5 text-sm font-medium text-on-surface-variant ghost-border rounded-lg hover:bg-surface-low transition-colors"
            disabled
          >
            {t("bulkUpload")}
          </button>
          <button className="px-4 py-2.5 text-sm font-semibold text-white btn-gradient rounded-lg">
            + {t("addNewProduct")}
          </button>
        </div>
      </div>

      {/* Product table placeholder */}
      <div className="bg-surface-lowest rounded-xl shadow-aegean overflow-hidden">
        <div className="p-8 text-center text-on-surface-variant">
          <p>No products yet. Add your first product to get started.</p>
        </div>
      </div>
    </div>
  );
}
