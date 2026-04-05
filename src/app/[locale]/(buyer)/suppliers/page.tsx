"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Star, Search } from "lucide-react";
import Image from "next/image";

interface Supplier {
  id: string;
  businessName: string;
  logo: string | null;
  city: string | null;
  region: string | null;
  description: string | null;
  avgRating: number | null;
  _count: { products: number; reviews: number };
}

export default function SuppliersPage() {
  const t = useTranslations();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/suppliers?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setSuppliers(data.suppliers || []);
        setLoading(false);
      });
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold">
          {t("nav.suppliers")}
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={`${t("common.search")} suppliers...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 h-10 pl-9 pr-3 text-sm bg-surface-lowest ghost-border rounded-lg focus:ghost-border-focus focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-on-surface-variant">{t("common.loading")}</p>
      ) : suppliers.length === 0 ? (
        <div className="bg-surface-lowest rounded-xl p-8 text-center shadow-aegean">
          <p className="text-on-surface-variant">{t("common.noResults")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/suppliers/${supplier.id}`}
              className="bg-surface-lowest rounded-xl overflow-hidden shadow-aegean hover:shadow-lg transition-shadow"
            >
              <div className="h-44 bg-surface-high flex items-center justify-center">
                {supplier.logo ? (
                  <Image
                    src={supplier.logo}
                    alt={supplier.businessName}
                    width={200}
                    height={176}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-heading font-bold text-on-surface-variant/20">
                    {supplier.businessName[0]}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-semibold">
                  {supplier.businessName}
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  {[supplier.city, supplier.region].filter(Boolean).join(", ") || "Greece"}
                </p>
                {supplier.description && (
                  <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">
                    {supplier.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {supplier.avgRating && (
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {supplier.avgRating.toFixed(1)}
                      </span>
                    )}
                    <span className="text-xs text-on-surface-variant">
                      ({supplier._count.reviews} reviews)
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    {supplier._count.products} products
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
