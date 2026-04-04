"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t("loginError"));
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-surface-lowest rounded-2xl shadow-aegean p-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-aegean">
            {t("login")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-on-surface">
              {t("email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-surface-high ghost-border focus:ghost-border-focus"
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-on-surface">
              {t("password")}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-surface-high ghost-border focus:ghost-border-focus"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-semibold text-white btn-gradient rounded-xl disabled:opacity-50 transition-opacity"
          >
            {loading ? "..." : t("login")}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          {t("dontHaveAccount")}{" "}
          <Link
            href="/register"
            className="text-aegean font-medium hover:underline"
          >
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
