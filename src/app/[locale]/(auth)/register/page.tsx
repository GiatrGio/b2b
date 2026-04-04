"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = "BUYER" | "SUPPLIER";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    businessName: "",
    businessType: "",
    role: "BUYER" as Role,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (form.password.length < 8) {
      setError(t("passwordMinLength"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          role: form.role,
          businessName: form.businessName,
          businessType: form.businessType || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          setError(t("emailExists"));
        } else {
          setError(data.error || t("registerError"));
        }
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("registerError"));
        setLoading(false);
      } else {
        router.push(form.role === "SUPPLIER" ? "/supplier" : "/");
      }
    } catch {
      setError(t("registerError"));
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-surface-lowest rounded-2xl shadow-aegean p-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-aegean">
            {t("register")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {/* Role selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-on-surface">
              {t("role")}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {(["BUYER", "SUPPLIER"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => updateField("role", role)}
                  className={`p-3 text-sm font-medium rounded-xl transition-colors ${
                    form.role === role
                      ? "bg-aegean text-white"
                      : "bg-surface-high text-on-surface-variant ghost-border hover:bg-surface-low"
                  }`}
                >
                  {role === "BUYER" ? t("buyer") : t("supplier")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-on-surface">
              {t("name")}
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
              className="bg-surface-high ghost-border focus:ghost-border-focus"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-on-surface">
              {t("email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              className="bg-surface-high ghost-border focus:ghost-border-focus"
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-sm font-medium text-on-surface">
              {t("businessName")}
            </Label>
            <Input
              id="businessName"
              value={form.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              required
              className="bg-surface-high ghost-border focus:ghost-border-focus"
            />
          </div>

          {form.role === "BUYER" && (
            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-sm font-medium text-on-surface">
                {t("businessType")}
              </Label>
              <select
                id="businessType"
                value={form.businessType}
                onChange={(e) => updateField("businessType", e.target.value)}
                className="w-full h-10 px-3 text-sm bg-surface-high ghost-border rounded-lg focus:ghost-border-focus focus:outline-none"
              >
                <option value="">Select type...</option>
                <option value="restaurant">Restaurant</option>
                <option value="bar">Bar</option>
                <option value="cafe">Cafe</option>
                <option value="hotel">Hotel</option>
                <option value="catering">Catering</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-on-surface">
              {t("password")}
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
              minLength={8}
              className="bg-surface-high ghost-border focus:ghost-border-focus"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-on-surface">
              {t("confirmPassword")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              required
              className="bg-surface-high ghost-border focus:ghost-border-focus"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-semibold text-white btn-gradient rounded-xl disabled:opacity-50 transition-opacity"
          >
            {loading ? "..." : t("register")}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          {t("alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="text-aegean font-medium hover:underline"
          >
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
