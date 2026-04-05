"use client";

import { useState, useEffect, use } from "react";
import { useTranslations, useLocale } from "next-intl";
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

interface Category {
  id: string;
  nameEn: string;
  nameEl: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  variants: Variant[];
  category: Category;
  supplier: { id: string; businessName: string; logo: string | null };
  _count: { reviews: number };
}

interface MainCategory {
  id: string;
  nameEn: string;
  nameEl: string;
  slug: string;
  children: Category[];
}

export default function SubcategoryPage({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}) {
  const { slug, sub } = use(params);
  const t = useTranslations("buyer.catalog");
  const tc = useTranslations("common");
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);

  const [mainCategory, setMainCategory] = useState<MainCategory | null>(null);
  const [subcategory, setSubcategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getName = (cat: { nameEn: string; nameEl: string }) =>
    locale === "el" ? cat.nameEl : cat.nameEn;

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats: MainCategory[]) => {
        const parent = cats.find((c) => c.slug === slug);
        if (parent) {
          setMainCategory(parent);
          const subcat = parent.children.find((c) => c.slug === sub);
          if (subcat) {
            setSubcategory(subcat);
            setSelectedSubcategory(subcat.id);
          }
        }
        setLoading(false);
      });
  }, [slug, sub]);

  useEffect(() => {
    if (!selectedSubcategory && !mainCategory) return;

    const params = new URLSearchParams();
    if (selectedSubcategory) {
      params.set("categoryId", selectedSubcategory);
    } else if (mainCategory) {
      params.set("parentCategoryId", mainCategory.id);
    }
    if (search) params.set("search", search);
    params.set("limit", "50");

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
      });
  }, [mainCategory, selectedSubcategory, search]);

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

  if (loading) {
    return <p className="text-on-surface-variant p-8">{tc("loading")}</p>;
  }

  if (!mainCategory) {
    return (
      <div className="bg-surface-lowest rounded-xl p-8 text-center shadow-aegean">
        <p className="text-on-surface-variant">{tc("noResults")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-1">
          <Link href={`/category/${slug}`} className="hover:text-aegean">
            {getName(mainCategory)}
          </Link>
          <span>/</span>
          <span className="text-on-surface font-medium">
            {subcategory ? getName(subcategory) : sub}
          </span>
        </div>
        <h1 className="font-heading text-3xl font-bold">
          {subcategory ? getName(subcategory) : sub}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Subcategory Sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="space-y-1">
            <Link
              href={`/category/${slug}`}
              className="block w-full text-left px-3 py-2 text-sm rounded-lg text-on-surface hover:bg-surface-low transition-colors"
            >
              All {getName(mainCategory)}
            </Link>
            {mainCategory.children.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSubcategory(s.id)}
                className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedSubcategory === s.id
                    ? "bg-aegean text-white font-medium"
                    : "text-on-surface hover:bg-surface-low"
                }`}
              >
                {getName(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-sm bg-surface-lowest ghost-border rounded-lg focus:ghost-border-focus focus:outline-none"
            />
          </div>

          {products.length === 0 ? (
            <div className="bg-surface-lowest rounded-xl p-8 text-center shadow-aegean">
              <p className="text-on-surface-variant">{tc("noResults")}</p>
            </div>
          ) : (
            <div className="bg-surface-lowest rounded-xl shadow-aegean overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide border-b border-border">
                <div className="col-span-4">Product Details</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Unit/Case</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2"></div>
              </div>

              {products.map((product) => (
                <div key={product.id} className="border-b border-border last:border-b-0">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-5 py-4 hover:bg-surface-low/50 transition-colors"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-surface-high rounded-lg flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.title}</p>
                          <Link
                            href={`/suppliers/${product.supplier.id}`}
                            className="text-xs text-aegean hover:underline"
                          >
                            {product.supplier.businessName}
                          </Link>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className="px-2 py-1 text-xs font-medium bg-surface-low rounded text-on-surface-variant">
                          {getName(product.category)}
                        </span>
                      </div>

                      <div className="col-span-2 text-sm text-on-surface-variant">
                        {variant.label}
                      </div>

                      <div className="col-span-2">
                        <span className="font-semibold text-aegean">
                          &euro;{parseFloat(variant.price).toFixed(2)}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-1">
                        {variant.stock > 0 ? (
                          <>
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
                                  [variant.id]: Math.min(
                                    variant.stock,
                                    (prev[variant.id] || 0) + 1
                                  ),
                                }))
                              }
                              className="p-1 rounded hover:bg-surface-low"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleAddToCart(product, variant)}
                              disabled={!quantities[variant.id]}
                              className="p-2 rounded-lg btn-gradient text-white disabled:opacity-50 ml-1"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-red-600 font-medium">
                            {t("outOfStock")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
