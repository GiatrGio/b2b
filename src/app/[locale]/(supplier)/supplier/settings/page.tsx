import { useTranslations } from "next-intl";

export default function SupplierSettingsPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">{t("nav.settings")}</h1>

      <div className="bg-surface-lowest rounded-xl shadow-aegean p-6">
        <p className="text-on-surface-variant">
          Profile and settings management coming soon.
        </p>
      </div>
    </div>
  );
}
