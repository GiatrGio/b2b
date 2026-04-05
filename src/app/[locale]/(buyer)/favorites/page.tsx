"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Heart, Star } from "lucide-react";
import Image from "next/image";

interface FavoriteProduct {
  id: string;
  title: string;
  images: string[];
  variants: Array<{ id: string; price: string }>;
  supplier: { id: string; businessName: string };
  _count: { reviews: number };
}

interface Favorite {
  id: string;
  targetType: string;
  productId: string | null;
  product: FavoriteProduct | null;
}

export default function FavoritesPage() {
  const t = useTranslations();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    const res = await fetch("/api/favorites");
    const data = await res.json();
    setFavorites(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const toggleFavorite = async (fav: Favorite) => {
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: fav.targetType,
        productId: fav.productId,
      }),
    });
    fetchFavorites();
  };

  if (loading) {
    return <p className="text-on-surface-variant">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">{t("nav.favorites")}</h1>

      {favorites.length === 0 ? (
        <div className="bg-surface-lowest rounded-xl p-8 text-center shadow-aegean">
          <p className="text-on-surface-variant">
            No favorites yet. Browse the marketplace and add items you like.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 text-sm font-semibold text-white btn-gradient rounded-xl"
          >
            {t("nav.marketplace")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites
            .filter((f) => f.product)
            .map((fav) => {
              const product = fav.product!;
              const lowestPrice = product.variants.length
                ? Math.min(...product.variants.map((v) => parseFloat(v.price)))
                : 0;

              return (
                <div
                  key={fav.id}
                  className="bg-surface-lowest rounded-xl overflow-hidden shadow-aegean"
                >
                  <div className="relative h-40 bg-surface-high">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                    <button
                      onClick={() => toggleFavorite(fav)}
                      className="absolute top-3 right-3 p-2 rounded-full glass"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <Link
                      href={`/suppliers/${product.supplier.id}`}
                      className="text-xs text-aegean hover:underline"
                    >
                      {product.supplier.businessName}
                    </Link>
                    <h3 className="font-semibold mt-1">{product.title}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-aegean">
                        &euro;{lowestPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {product._count.reviews} reviews
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
