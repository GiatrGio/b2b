"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/stores/cart-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ShoppingCart } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";

interface Subcategory {
  id: string;
  nameEn: string;
  nameEl: string;
  slug: string;
}

interface MainCategory {
  id: string;
  nameEn: string;
  nameEl: string;
  slug: string;
  children: Subcategory[];
}

export function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.getItemCount());

  const user = session?.user;
  const isSupplier = user?.role === "SUPPLIER";
  const isBuyer = user?.role === "BUYER";

  // Category nav state
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isBuyer || !user) {
      fetch("/api/categories")
        .then((r) => r.json())
        .then(setCategories);
    }
  }, [isBuyer, user]);

  const handleMouseEnter = (slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenSlug(slug);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenSlug(null), 150);
  };

  const getName = (cat: { nameEn: string; nameEl: string }) =>
    locale === "el" ? cat.nameEl : cat.nameEn;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: logo + category nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-heading text-xl font-bold text-aegean">
              {t("app.name")}
            </span>
          </Link>

          {/* Inline category navigation (buyer / unauthenticated) */}
          {!isSupplier && (
            <nav className="hidden lg:flex items-center gap-1">
              {categories.map((cat) => {
                const isActive =
                  pathname === `/category/${cat.slug}` ||
                  cat.children.some(
                    (sub) => pathname === `/category/${cat.slug}/${sub.slug}`
                  );

                return (
                  <div
                    key={cat.id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(cat.slug)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={`/category/${cat.slug}`}
                      className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? "text-aegean border-b-2 border-aegean"
                          : "text-on-surface-variant hover:text-aegean"
                      }`}
                    >
                      {getName(cat)}
                    </Link>

                    {/* Subcategory dropdown */}
                    {openSlug === cat.slug && cat.children.length > 0 && (
                      <div
                        className="absolute left-0 top-full mt-0 pt-2 z-50"
                        onMouseEnter={() => handleMouseEnter(cat.slug)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="bg-surface-lowest rounded-xl shadow-lg border border-border py-2 min-w-[220px]">
                          {cat.children.map((sub) => {
                            const subActive =
                              pathname === `/category/${cat.slug}/${sub.slug}`;
                            return (
                              <Link
                                key={sub.id}
                                href={`/category/${cat.slug}/${sub.slug}`}
                                onClick={() => setOpenSlug(null)}
                                className={`block px-4 py-2.5 text-sm transition-colors ${
                                  subActive
                                    ? "text-aegean bg-aegean-50 font-medium"
                                    : "text-on-surface hover:bg-surface-low hover:text-aegean"
                                }`}
                              >
                                {getName(sub)}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-3">
          {(isBuyer || !user) && (
            <div className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`${t("common.search")}...`}
                  className="w-64 h-9 pl-9 pr-3 text-sm bg-surface-high rounded-lg ghost-border focus:ghost-border-focus focus:outline-none transition-colors"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          )}

          <LanguageSwitcher />

          <button className="relative p-2 rounded-lg hover:bg-surface-low transition-colors">
            <Bell className="h-5 w-5 text-on-surface-variant" />
          </button>

          {isBuyer && (
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-surface-low transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-on-surface-variant" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-aegean text-white text-xs flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-low transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="bg-aegean text-white text-xs">
                    {user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = isSupplier
                      ? "/supplier/settings"
                      : "/profile";
                  }}
                >
                  {t("nav.profile")}
                </DropdownMenuItem>
                {isBuyer && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = "/orders";
                      }}
                    >
                      {t("nav.orders")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = "/favorites";
                      }}
                    >
                      {t("nav.favorites")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = "/suppliers";
                      }}
                    >
                      {t("nav.suppliers")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = "/invoices";
                      }}
                    >
                      {t("nav.invoices")}
                    </DropdownMenuItem>
                  </>
                )}
                {isSupplier && (
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href = "/supplier";
                    }}
                  >
                    {t("supplier.portal")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-medium text-aegean hover:bg-aegean-50 rounded-lg transition-colors"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 text-sm font-medium text-white btn-gradient rounded-lg transition-colors"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
