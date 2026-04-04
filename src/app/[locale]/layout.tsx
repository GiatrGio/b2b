import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Inter, Manrope } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin", "greek"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin", "greek"],
  variable: "--font-manrope",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-surface font-sans text-on-surface antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
