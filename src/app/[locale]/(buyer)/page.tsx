import { useTranslations } from "next-intl";

export default function BuyerDashboard() {
  const t = useTranslations("buyer.dashboard");

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>

      {/* Supply Categories */}
      <section>
        <h2 className="font-heading text-xl font-semibold mb-4">
          {t("supplyCategories")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Placeholder category cards */}
          {["Produce", "Meat & Seafood", "Dairy", "Beverages"].map(
            (category) => (
              <div
                key={category}
                className="bg-surface-lowest rounded-xl p-6 text-center shadow-aegean hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <p className="font-heading text-lg font-semibold text-on-surface">
                  {category}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Featured Suppliers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold">
            {t("featuredSuppliers")}
          </h2>
          <button className="text-sm text-aegean font-medium hover:underline">
            {t("viewAll")}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Placeholder - will be populated from DB */}
          <div className="bg-surface-lowest rounded-xl overflow-hidden shadow-aegean">
            <div className="h-40 bg-surface-high" />
            <div className="p-4">
              <p className="font-heading font-semibold">
                No suppliers yet
              </p>
              <p className="text-sm text-on-surface-variant mt-1">
                Suppliers will appear here once registered
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
