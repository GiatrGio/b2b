"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Category {
  id: string;
  nameEn: string;
  nameEl: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
}

export default function AdminPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    nameEn: "",
    nameEl: "",
    slug: "",
    icon: "",
    sortOrder: 0,
  });

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nameEn: "", nameEl: "", slug: "", icon: "", sortOrder: 0 });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      nameEn: cat.nameEn,
      nameEl: cat.nameEl,
      slug: cat.slug,
      icon: cat.icon || "",
      sortOrder: cat.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      icon: form.icon || undefined,
    };

    if (editing) {
      await fetch(`/api/categories/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setDialogOpen(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("categories.confirmDelete"))) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const autoSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
      </div>

      <div className="bg-surface-lowest rounded-xl shadow-aegean p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-semibold">
            {t("categories.title")}
          </h2>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white btn-gradient rounded-lg"
          >
            <Plus className="h-4 w-4" />
            {t("categories.addCategory")}
          </button>
        </div>

        {loading ? (
          <p className="text-on-surface-variant">{tc("loading")}</p>
        ) : categories.length === 0 ? (
          <p className="text-on-surface-variant">{tc("noResults")}</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  idx % 2 === 1 ? "bg-surface-low" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-on-surface-variant w-8">
                    #{cat.sortOrder}
                  </span>
                  <div>
                    <p className="font-medium text-on-surface">{cat.nameEn}</p>
                    <p className="text-sm text-on-surface-variant">
                      {cat.nameEl} &middot; /{cat.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 rounded-lg hover:bg-surface-low text-on-surface-variant hover:text-aegean transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-surface-lowest">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editing ? t("categories.editCategory") : t("categories.addCategory")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{t("categories.nameEn")}</Label>
              <Input
                value={form.nameEn}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    nameEn: val,
                    ...(editing ? {} : { slug: autoSlug(val) }),
                  }));
                }}
                required
                className="bg-surface-high ghost-border"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("categories.nameEl")}</Label>
              <Input
                value={form.nameEl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nameEl: e.target.value }))
                }
                required
                className="bg-surface-high ghost-border"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("categories.slug")}</Label>
              <Input
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
                pattern="^[a-z0-9-]+$"
                className="bg-surface-high ghost-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("categories.icon")}</Label>
                <Input
                  value={form.icon}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="e.g. leaf, wine, milk"
                  className="bg-surface-high ghost-border"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("categories.sortOrder")}</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="bg-surface-high ghost-border"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-on-surface-variant ghost-border rounded-lg hover:bg-surface-low"
              >
                {tc("cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white btn-gradient rounded-lg"
              >
                {editing ? tc("save") : tc("create")}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
