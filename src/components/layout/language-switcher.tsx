"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "el" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="px-2 py-1.5 text-xs font-medium text-on-surface-variant hover:text-aegean hover:bg-surface-low rounded-lg transition-colors"
      title={locale === "en" ? "Αλλαγή σε Ελληνικά" : "Switch to English"}
    >
      {locale === "en" ? "EL" : "EN"}
    </button>
  );
}
