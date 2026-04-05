"use client";

import { useState, useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/stores/cart-store";
import { Star, MapPin, Phone, Globe, Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

const SupplierMap = dynamic(() => import("@/components/shared/supplier-map"), {
  ssr: false,
  loading: () => <div className="h-48 bg-surface-high rounded-xl" />,
});

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
  category: { nameEn: string };
  _count: { reviews: number };
}

interface SupplierData {
  id: string;
  businessName: string;
  description: string | null;
  logo: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  products: Product[];
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    author: { name: string | null };
    createdAt: string;
  }>;
  avgRating: number | null;
  categories: Array<{ id: string; nameEn: string; slug: string }>;
  _count: { products: number; reviews: number };
}

export default function SupplierProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("buyer");
  const tc = useTranslations("common");
  const addItem = useCartStore((s) => s.addItem);
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch(`/api/suppliers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setSupplier(data);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = (product: Product, variant: Variant) => {
    const qty = quantities[variant.id] || 1;
    addItem(
      {
        productId: product.id,
        variantId: variant.id,
        supplierId: supplier!.id,
        supplierName: supplier!.businessName,
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
    return <p className="text-on-surface-variant">{tc("loading")}</p>;
  }
  if (!supplier) {
    return <p className="text-on-surface-variant">{tc("error")}</p>;
  }

  return (
    <div className="space-y-8">
      {/* Supplier header */}
      <div className="bg-surface-lowest rounded-2xl shadow-aegean overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-aegean to-aegean-light">
          {supplier.logo && (
            <div className="absolute bottom-4 left-6 w-20 h-20 rounded-xl bg-white shadow-lg overflow-hidden">
              <Image
                src={supplier.logo}
                alt={supplier.businessName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        <div className="p-6 pt-3">
          <h1 className="font-heading text-2xl font-bold">
            {supplier.businessName}
          </h1>
          {supplier.avgRating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(supplier.avgRating!)
                        ? "fill-amber-400 text-amber-400"
                        : "text-outline-variant"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-on-surface-variant">
                {supplier.avgRating.toFixed(1)} ({supplier._count.reviews} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {supplier.description && (
            <section>
              <h2 className="font-heading text-xl font-semibold mb-3">
                {t("supplier.aboutTheEstate")}
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                {supplier.description}
              </p>
            </section>
          )}

          {/* Products */}
          <section>
            <h2 className="font-heading text-xl font-semibold mb-4">
              Products ({supplier._count.products})
            </h2>
            <div className="space-y-3">
              {supplier.products.map((product) => (
                <div
                  key={product.id}
                  className="bg-surface-lowest rounded-xl p-4 shadow-aegean"
                >
                  <div className="flex gap-4">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-surface-high rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-medium text-aegean bg-aegean-50 px-2 py-0.5 rounded">
                            {product.category.nameEn}
                          </span>
                          <h3 className="font-semibold mt-1">{product.title}</h3>
                          {product.description && (
                            <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Variants */}
                      <div className="mt-3 space-y-2">
                        {product.variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="flex items-center justify-between gap-3 py-2"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm">{variant.label}</span>
                              {variant.sku && (
                                <span className="text-xs text-on-surface-variant ml-2">
                                  SKU: {variant.sku}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-semibold text-aegean whitespace-nowrap">
                                &euro;{parseFloat(variant.price).toFixed(2)}
                              </span>
                              <span
                                className={`text-xs whitespace-nowrap ${
                                  variant.stock === 0
                                    ? "text-red-600"
                                    : variant.stock < 15
                                    ? "text-amber-600"
                                    : "text-olive"
                                }`}
                              >
                                {variant.stock === 0
                                  ? "Out of Stock"
                                  : `${variant.stock} units`}
                              </span>
                              {variant.stock > 0 && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      setQuantities((prev) => ({
                                        ...prev,
                                        [variant.id]: Math.max(
                                          0,
                                          (prev[variant.id] || 0) - 1
                                        ),
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
                                    onClick={() =>
                                      handleAddToCart(product, variant)
                                    }
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
          </section>

          {/* Reviews */}
          {supplier.reviews.length > 0 && (
            <section>
              <h2 className="font-heading text-xl font-semibold mb-4">
                {t("supplier.reviews")}
              </h2>
              <div className="space-y-4">
                {supplier.reviews.map((review) => (
                  <div key={review.id} className="bg-surface-lowest rounded-xl p-4 shadow-aegean">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">
                        {review.author.name || "Anonymous"}
                      </span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-outline-variant"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-on-surface-variant">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact */}
          <div className="bg-surface-lowest rounded-xl p-5 shadow-aegean space-y-4">
            <h3 className="font-heading font-semibold">
              {t("supplier.logisticsContact")}
            </h3>
            {supplier.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-aegean flex-shrink-0" />
                <span className="text-on-surface-variant">
                  {supplier.address}
                  {supplier.city && `, ${supplier.city}`}
                  {supplier.postalCode && ` ${supplier.postalCode}`}
                </span>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-aegean" />
                <span className="text-on-surface-variant">{supplier.phone}</span>
              </div>
            )}
            {supplier.website && (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-4 w-4 text-aegean" />
                <a
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-aegean hover:underline"
                >
                  Website
                </a>
              </div>
            )}
          </div>

          {/* Categories */}
          {supplier.categories.length > 0 && (
            <div className="bg-surface-lowest rounded-xl p-5 shadow-aegean">
              <h3 className="font-heading font-semibold mb-3">
                {t("supplier.topCategories")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {supplier.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3 py-1.5 text-xs font-medium bg-aegean-50 text-aegean rounded-lg"
                  >
                    {cat.nameEn}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {supplier.latitude && supplier.longitude && (
            <div className="bg-surface-lowest rounded-xl p-5 shadow-aegean">
              <h3 className="font-heading font-semibold mb-3">Location</h3>
              <SupplierMap
                lat={supplier.latitude}
                lng={supplier.longitude}
                name={supplier.businessName}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
