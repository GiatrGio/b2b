"use client";

import { useTranslations } from "next-intl";
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
import { Bell, ShoppingCart, Menu } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { LanguageSwitcher } from "./language-switcher";

export function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const user = session?.user;
  const isSupplier = user?.role === "SUPPLIER";
  const isBuyer = user?.role === "BUYER";

  const buyerNavItems = [
    { href: "/", label: t("nav.marketplace") },
    { href: "/suppliers", label: t("nav.suppliers") },
    { href: "/invoices", label: t("nav.invoices") },
  ];

  const supplierNavItems = [
    { href: "/supplier", label: t("supplier.portal") },
  ];

  const navItems = isSupplier ? supplierNavItems : buyerNavItems;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: hamburger + logo + nav */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-low"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-aegean">
              {t("app.name")}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-aegean bg-aegean-50"
                      : "text-on-surface-variant hover:text-aegean hover:bg-surface-low"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-3">
          {isBuyer && (
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
                    window.location.href = isSupplier ? "/supplier/settings" : "/profile";
                  }}
                >
                  {t("nav.profile")}
                </DropdownMenuItem>
                {isBuyer && (
                  <>
                    <DropdownMenuItem
                      onClick={() => { window.location.href = "/orders"; }}
                    >
                      {t("nav.orders")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => { window.location.href = "/favorites"; }}
                    >
                      {t("nav.favorites")}
                    </DropdownMenuItem>
                  </>
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
