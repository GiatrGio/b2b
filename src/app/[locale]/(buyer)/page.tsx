"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Star } from "lucide-react";
import Image from "next/image";

interface Supplier {
  id: string;
  businessName: string;
  logo: string | null;
  city: string | null;
  region: string | null;
  avgRating: number | null;
  _count: { products: number; reviews: number };
}

interface Category {
  id: string;
  nameEn: string;
  nameEl: string;
  slug: string;
  icon: string | null;
  children?: Category[];
}

export default function BuyerDashboard() {
  const t = useTranslations("buyer.dashboard");

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    fetch("/api/suppliers?limit=6")
      .then((r) => r.json())
      .then((data) => setSuppliers(data.suppliers || []));
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-aegean to-aegean-light p-8 md:p-12 text-white">
        <div className="relative z-10 max-w-lg">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">
            Direct from the Producers
          </h1>
          <p className="mt-3 text-white/80 text-sm md:text-base">
            Browse premium products from verified regional suppliers across Greece.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/suppliers"
              className="px-5 py-2.5 text-sm font-semibold bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
            >
              Browse Suppliers
            </Link>
          </div>
        </div>
      </div>

      {/* Supply Categories */}
      <section>
        <h2 className="font-heading text-xl font-semibold mb-4">
          {t("supplyCategories")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="bg-surface-lowest rounded-xl p-6 text-center shadow-aegean hover:scale-[1.02] transition-transform"
            >
              <p className="font-heading text-lg font-semibold text-on-surface">
                {cat.nameEn}
              </p>
            </Link>
          ))}
          {categories.length === 0 && (
            <p className="col-span-full text-on-surface-variant text-sm">
              No categories yet. An admin needs to add them first.
            </p>
          )}
        </div>
      </section>

      {/* Featured Suppliers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold">
            {t("featuredSuppliers")}
          </h2>
          <Link
            href="/suppliers"
            className="text-sm text-aegean font-medium hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/suppliers/${supplier.id}`}
              className="bg-surface-lowest rounded-xl overflow-hidden shadow-aegean hover:shadow-lg transition-shadow"
            >
              <div className="h-40 bg-surface-high flex items-center justify-center">
                {supplier.logo ? (
                  <Image
                    src={supplier.logo}
                    alt={supplier.businessName}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-heading font-bold text-on-surface-variant/30">
                    {supplier.businessName[0]}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-heading font-semibold text-on-surface">
                  {supplier.businessName}
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {[supplier.city, supplier.region].filter(Boolean).join(", ") ||
                    "Greece"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {supplier.avgRating && (
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {supplier.avgRating.toFixed(1)}
                    </span>
                  )}
                  <span className="text-xs text-on-surface-variant">
                    ({supplier._count.reviews} {t("reviews")})
                  </span>
                </div>
                <div className="mt-3">
                  <span className="px-3 py-1.5 text-xs font-medium text-aegean ghost-border rounded-lg">
                    {t("viewCatalog")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {suppliers.length === 0 && (
            <div className="col-span-full bg-surface-lowest rounded-xl p-8 text-center shadow-aegean">
              <p className="text-on-surface-variant">
                No suppliers registered yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
