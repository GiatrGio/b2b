"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useUIStore } from "@/stores/ui-store";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  BarChart3,
  Package,
  ShoppingBag,
  Settings,
  HelpCircle,
} from "lucide-react";

export function SupplierSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const navItems = [
    {
      href: "/supplier",
      label: t("nav.dashboard"),
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      href: "/supplier/inventory",
      label: t("nav.inventory"),
      icon: <Package className="h-5 w-5" />,
    },
    {
      href: "/supplier/orders",
      label: t("nav.orders"),
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      href: "/supplier/settings",
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
            (item.href !== "/supplier" && pathname.startsWith(item.href));
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

      <div className="px-3 pb-4">
        <Link
          href="/supplier"
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-low rounded-lg transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
          {t("nav.support")}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 bg-surface-low min-h-[calc(100vh-4rem)]">
        <SidebarContent />
      </aside>

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
