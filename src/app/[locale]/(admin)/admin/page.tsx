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
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  nameEn: string;
  nameEl: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  parentId: string | null;
  children?: Category[];
}

export default function AdminPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [parentForNew, setParentForNew] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    nameEn: "",
    nameEl: "",
    slug: "",
    icon: "",
    sortOrder: 0,
    parentId: null as string | null,
  });

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
    // Auto-expand all on first load
    setExpandedCategories(new Set(data.map((c: Category) => c.id)));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleExpand = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreateSubcategory = (parent: Category) => {
    setEditing(null);
    setParentForNew(parent);
    setForm({
      nameEn: "",
      nameEl: "",
      slug: "",
      icon: "",
      sortOrder: (parent.children?.length || 0) + 1,
      parentId: parent.id,
    });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setParentForNew(null);
    setForm({
      nameEn: cat.nameEn,
      nameEl: cat.nameEl,
      slug: cat.slug,
      icon: cat.icon || "",
      sortOrder: cat.sortOrder,
      parentId: cat.parentId,
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

  const isMainCategory = (cat: Category) => cat.parentId === null;

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
        </div>

        {loading ? (
          <p className="text-on-surface-variant">{tc("loading")}</p>
        ) : categories.length === 0 ? (
          <p className="text-on-surface-variant">{tc("noResults")}</p>
        ) : (
          <div className="space-y-1">
            {categories.map((cat) => (
              <div key={cat.id}>
                {/* Main Category Row */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface-low">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(cat.id)}
                      className="p-1 rounded hover:bg-surface-high"
                    >
                      {expandedCategories.has(cat.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <div>
                      <p className="font-semibold text-on-surface">{cat.nameEn}</p>
                      <p className="text-sm text-on-surface-variant">
                        {cat.nameEl} &middot; /{cat.slug}
                        {cat.children && (
                          <span className="ml-2">
                            ({cat.children.length} {t("categories.subcategories").toLowerCase()})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCreateSubcategory(cat)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-aegean ghost-border rounded-lg hover:bg-aegean-50 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      {t("categories.addSubcategory")}
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {expandedCategories.has(cat.id) && cat.children && cat.children.length > 0 && (
                  <div className="ml-10 mt-1 space-y-1">
                    {cat.children.map((sub, idx) => (
                      <div
                        key={sub.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          idx % 2 === 1 ? "bg-surface-low/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-on-surface-variant w-6">
                            #{sub.sortOrder}
                          </span>
                          <div>
                            <p className="font-medium text-sm text-on-surface">{sub.nameEn}</p>
                            <p className="text-xs text-on-surface-variant">
                              {sub.nameEl} &middot; /{sub.slug}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(sub)}
                            className="p-2 rounded-lg hover:bg-surface-low text-on-surface-variant hover:text-aegean transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Subcategory Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-surface-lowest">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editing
                ? t("categories.editSubcategory")
                : `${t("categories.addSubcategory")} — ${parentForNew?.nameEn || ""}`}
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
