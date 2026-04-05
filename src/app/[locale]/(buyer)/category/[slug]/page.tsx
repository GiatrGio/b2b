"use client";

import { useState, useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/stores/cart-store";
import { Link } from "@/i18n/routing";
import { Search, Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";

interface Variant {
  id: string;
  label: string;
  sku: string | null;
  price: string;
  stock: number;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  variants: Variant[];
  supplier: { id: string; businessName: string; logo: string | null };
  _count: { reviews: number };
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations("buyer.catalog");
  const tc = useTranslations("common");
  const addItem = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<Array<{ id: string; slug: string; nameEn: string }>>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) {
      if (categories.length > 0) setLoading(false);
      return;
    }

    const params = new URLSearchParams({ categoryId: cat.id });
    if (search) params.set("search", search);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      });
  }, [slug, search, categories]);

  const categoryName = categories.find((c) => c.slug === slug)?.nameEn || slug;

  const handleAddToCart = (product: Product, variant: Variant) => {
    const qty = quantities[variant.id] || 1;
    addItem(
      {
        productId: product.id,
        variantId: variant.id,
        supplierId: product.supplier.id,
        supplierName: product.supplier.businessName,
        productTitle: product.title,
        variantLabel: variant.label,
        price: parseFloat(variant.price),
        image: product.images[0],
      },
      qty
    );
    setQuantities((prev) => ({ ...prev, [variant.id]: 0 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">{categoryName}</h1>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-3 text-sm bg-surface-lowest ghost-border rounded-lg focus:ghost-border-focus focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="text-on-surface-variant">{tc("loading")}</p>
      ) : products.length === 0 ? (
        <div className="bg-surface-lowest rounded-xl p-8 text-center shadow-aegean">
          <p className="text-on-surface-variant">{tc("noResults")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-surface-lowest rounded-xl p-5 shadow-aegean"
            >
              <div className="flex gap-4">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 bg-surface-high rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1">
                  <Link
                    href={`/suppliers/${product.supplier.id}`}
                    className="text-xs text-aegean hover:underline"
                  >
                    {product.supplier.businessName}
                  </Link>
                  <h3 className="font-semibold mt-1">{product.title}</h3>
                  {product.description && (
                    <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-3 space-y-2">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between gap-2 py-1"
                      >
                        <span className="text-sm">{variant.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-aegean">
                            &euro;{parseFloat(variant.price).toFixed(2)}
                          </span>
                          <span
                            className={`text-xs ${
                              variant.stock === 0
                                ? "text-red-600"
                                : variant.stock < 15
                                ? "text-amber-600"
                                : "text-olive"
                            }`}
                          >
                            {variant.stock === 0
                              ? t("outOfStock")
                              : `${variant.stock} units`}
                          </span>
                          {variant.stock > 0 && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setQuantities((prev) => ({
                                    ...prev,
                                    [variant.id]: Math.max(0, (prev[variant.id] || 0) - 1),
                                  }))
                                }
                                className="p-1 rounded hover:bg-surface-low"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm">
                                {quantities[variant.id] || 0}
                              </span>
                              <button
                                onClick={() =>
                                  setQuantities((prev) => ({
                                    ...prev,
                                    [variant.id]: Math.min(variant.stock, (prev[variant.id] || 0) + 1),
                                  }))
                                }
                                className="p-1 rounded hover:bg-surface-low"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleAddToCart(product, variant)}
                                disabled={!quantities[variant.id]}
                                className="p-2 rounded-lg btn-gradient text-white disabled:opacity-50"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
