import { useTranslations } from "next-intl";

export default function SupplierDashboard() {
  const t = useTranslations("supplier.dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
        <p className="text-on-surface-variant mt-1">{t("subtitle")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("totalRevenue"), value: "€0.00" },
          { label: t("activeOrders"), value: "0" },
          { label: t("newCustomers"), value: "0" },
          { label: t("avgOrderValue"), value: "€0.00" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-lowest rounded-xl p-5 shadow-aegean"
          >
            <p className="text-sm text-on-surface-variant">{kpi.label}</p>
            <p className="text-2xl font-heading font-bold mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder for charts and recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface-lowest rounded-xl p-5 shadow-aegean min-h-[300px]">
          <h3 className="font-heading font-semibold">{t("salesTrend")}</h3>
          <p className="text-sm text-on-surface-variant mt-2">
            Chart will appear when you have sales data
          </p>
        </div>
        <div className="bg-surface-lowest rounded-xl p-5 shadow-aegean">
          <h3 className="font-heading font-semibold">
            {t("topSellingProducts")}
          </h3>
          <p className="text-sm text-on-surface-variant mt-2">
            No products yet
          </p>
        </div>
      </div>
    </div>
  );
}
