import { useTranslations } from "next-intl";

export default function AdminPage() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>

      <div className="bg-surface-lowest rounded-xl shadow-aegean p-6">
        <h2 className="font-heading text-xl font-semibold mb-4">
          {t("categories.title")}
        </h2>
        <p className="text-on-surface-variant">
          Category management will be implemented here.
        </p>
      </div>
    </div>
  );
}
