"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useUIStore } from "@/stores/ui-store";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Leaf,
  Wine,
  Milk,
  Beef,
  Package,
  HelpCircle,
  Settings,
} from "lucide-react";

interface CategoryItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function BuyerSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const navItems: CategoryItem[] = [
    {
      href: "/",
      label: t("nav.dashboard"),
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/category/produce",
      label: t("categories.produce"),
      icon: <Leaf className="h-5 w-5" />,
    },
    {
      href: "/category/beverages",
      label: t("categories.beverages"),
      icon: <Wine className="h-5 w-5" />,
    },
    {
      href: "/category/dairy",
      label: t("categories.dairy"),
      icon: <Milk className="h-5 w-5" />,
    },
    {
      href: "/category/meat-seafood",
      label: t("categories.meatSeafood"),
      icon: <Beef className="h-5 w-5" />,
    },
    {
      href: "/category/dry-goods",
      label: t("categories.dryGoods"),
      icon: <Package className="h-5 w-5" />,
    },
  ];

  const bottomItems: CategoryItem[] = [
    {
      href: "/support",
      label: t("nav.support"),
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      href: "/settings",
      label: t("nav.settings"),
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-aegean-50 text-aegean"
                  : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-1">
        <Link
          href="/cart"
          className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white btn-gradient rounded-xl transition-colors"
        >
          {t("buyer.dashboard.quickReorder")}
        </Link>

        <div className="mt-4 space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-aegean-50 text-aegean"
                    : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-surface-low min-h-[calc(100vh-4rem)]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-60 p-0 bg-surface-low">
          <div className="pt-4">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
