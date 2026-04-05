"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { TrendingUp, ShoppingBag, Users, DollarSign } from "lucide-react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TopProduct {
  id: string;
  title: string;
  image: string | null;
  revenue: number;
  units: number;
}

interface SalesTrendItem {
  date: string;
  revenue: number;
  orders: number;
}

interface RecentOrder {
  id: string;
  status: string;
  subtotal: string;
  createdAt: string;
  order: {
    buyer: { id: string; name: string | null };
  };
}

interface DashboardStats {
  totalRevenue: number;
  activeOrders: number;
  newCustomers: number;
  avgOrderValue: number;
  topProducts: TopProduct[];
  salesTrend: SalesTrendItem[];
  recentOrders: RecentOrder[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-aegean-50 text-aegean",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function SupplierDashboard() {
  const t = useTranslations("supplier.dashboard");
  const tc = useTranslations("common");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/suppliers/stats?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, [days]);

  if (loading) {
    return <p className="text-on-surface-variant">{tc("loading")}</p>;
  }

  if (!stats) {
    return <p className="text-on-surface-variant">{tc("error")}</p>;
  }

  const kpis = [
    {
      label: t("totalRevenue"),
      value: `€${stats.totalRevenue.toLocaleString("en", { minimumFractionDigits: 2 })}`,
      icon: <DollarSign className="h-5 w-5 text-aegean" />,
    },
    {
      label: t("activeOrders"),
      value: stats.activeOrders.toString(),
      icon: <ShoppingBag className="h-5 w-5 text-aegean" />,
    },
    {
      label: t("newCustomers"),
      value: stats.newCustomers.toString(),
      icon: <Users className="h-5 w-5 text-aegean" />,
    },
    {
      label: t("avgOrderValue"),
      value: `€${stats.avgOrderValue.toLocaleString("en", { minimumFractionDigits: 2 })}`,
      icon: <TrendingUp className="h-5 w-5 text-aegean" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
          <p className="text-on-surface-variant mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="h-9 px-3 text-sm bg-surface-lowest ghost-border rounded-lg"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>{t("last30Days")}</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-lowest rounded-xl p-5 shadow-aegean"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-aegean-50 rounded-lg">{kpi.icon}</div>
            </div>
            <p className="text-sm text-on-surface-variant">{kpi.label}</p>
            <p className="text-2xl font-heading font-bold mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-surface-lowest rounded-xl p-5 shadow-aegean">
          <h3 className="font-heading font-semibold mb-4">{t("salesTrend")}</h3>
          {stats.salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" ? `€${Number(value).toFixed(2)}` : value,
                    name === "revenue" ? t("revenue") : t("volume"),
                  ]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#003461" radius={[4, 4, 0, 0]} name={t("revenue")} />
                <Bar dataKey="orders" fill="#4a6741" radius={[4, 4, 0, 0]} name={t("volume")} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-on-surface-variant py-8 text-center">
              No sales data for this period.
            </p>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-surface-lowest rounded-xl p-5 shadow-aegean">
          <h3 className="font-heading font-semibold mb-4">
            {t("topSellingProducts")}
          </h3>
          {stats.topProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-surface-high rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {product.units} units sold
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-aegean whitespace-nowrap">
                    &euro;{product.revenue.toLocaleString("en", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">No products sold yet.</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-surface-lowest rounded-xl shadow-aegean overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="font-heading font-semibold">{t("recentOrders")}</h3>
          <a
            href="/supplier/orders"
            className="text-sm text-aegean font-medium hover:underline"
          >
            {tc("viewAll")}
          </a>
        </div>

        {stats.recentOrders.length > 0 ? (
          <div>
            {/* Header */}
            <div className="hidden md:grid grid-cols-5 gap-4 px-5 py-2 text-xs font-medium text-on-surface-variant uppercase">
              <div>Order ID</div>
              <div>Buyer</div>
              <div>Date</div>
              <div>Total</div>
              <div>Status</div>
            </div>
            {stats.recentOrders.map((order, idx) => (
              <div
                key={order.id}
                className={`grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 px-5 py-3 items-center ${
                  idx % 2 === 1 ? "bg-surface-low" : ""
                }`}
              >
                <span className="text-sm font-mono font-medium text-aegean">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-sm">
                  {order.order.buyer.name || "Unknown"}
                </span>
                <span className="text-sm text-on-surface-variant">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span className="text-sm font-medium">
                  &euro;{parseFloat(order.subtotal).toFixed(2)}
                </span>
                <span
                  className={`inline-flex w-fit px-2 py-0.5 text-xs font-medium rounded-full ${
                    statusColors[order.status] || "bg-gray-100"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-on-surface-variant text-sm">
            No orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
