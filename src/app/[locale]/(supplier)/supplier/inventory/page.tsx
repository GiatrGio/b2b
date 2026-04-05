"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import Image from "next/image";

interface Variant {
  id?: string;
  label: string;
  labelEl?: string;
  sku?: string;
  price: number;
  stock: number;
  isActive: boolean;
}

interface Product {
  id: string;
  title: string;
  titleEl?: string;
  description?: string;
  descriptionEl?: string;
  categoryId: string;
  images: string[];
  video?: string;
  isActive: boolean;
  variants: Variant[];
  category: { id: string; nameEn: string; nameEl: string; slug: string };
}

interface Category {
  id: string;
  nameEn: string;
  nameEl: string;
  slug: string;
  parentId?: string | null;
  parent?: { id: string; nameEn: string } | null;
}

const emptyVariant: Variant = {
  label: "",
  sku: "",
  price: 0,
  stock: 0,
  isActive: true,
};

export default function InventoryPage() {
  const t = useTranslations("supplier.inventory");
  const tc = useTranslations("common");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [form, setForm] = useState({
    title: "",
    titleEl: "",
    description: "",
    descriptionEl: "",
    categoryId: "",
    images: [] as string[],
    video: "",
    isActive: true,
    variants: [{ ...emptyVariant }] as Variant[],
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "10" });
    if (selectedCategory !== "all") params.set("categoryId", selectedCategory);
    // We need supplier-specific products - use the general endpoint with supplierId
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setLoading(false);
  }, [page, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories?flat=true");
    const all = await res.json();
    // Only show subcategories (with parentId) for product assignment
    setCategories(all.filter((c: Category) => c.parentId));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      titleEl: "",
      description: "",
      descriptionEl: "",
      categoryId: categories[0]?.id || "",
      images: [],
      video: "",
      isActive: true,
      variants: [{ ...emptyVariant }],
    });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      title: product.title,
      titleEl: product.titleEl || "",
      description: product.description || "",
      descriptionEl: product.descriptionEl || "",
      categoryId: product.categoryId,
      images: product.images,
      video: product.video || "",
      isActive: product.isActive,
      variants: product.variants.map((v) => ({ ...v })),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      video: form.video || undefined,
      variants: form.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        stock: Number(v.stock),
      })),
    };

    if (editing) {
      await fetch(`/api/products/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...emptyVariant }],
    }));
  };

  const removeVariant = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  };

  const updateVariant = (idx: number, field: string, value: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === idx ? { ...v, [field]: value } : v
      ),
    }));
  };

  const getStockStatus = (variants: Variant[]) => {
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    if (totalStock === 0) return { label: t("outOfStock"), color: "text-red-600" };
    if (totalStock < 15) return { label: t("lowStock"), color: "text-amber-600" };
    return { label: t("inStock"), color: "text-olive" };
  };

  const getLowestPrice = (variants: Variant[]) => {
    if (variants.length === 0) return 0;
    return Math.min(...variants.map((v) => Number(v.price)));
  };

  const getTotalStock = (variants: Variant[]) => {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
          <p className="text-on-surface-variant mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2.5 text-sm font-medium text-on-surface-variant ghost-border rounded-lg opacity-50 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            {t("bulkUpload")}
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white btn-gradient rounded-lg"
          >
            <Plus className="h-4 w-4" />
            {t("addNewProduct")}
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => { setSelectedCategory("all"); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === "all"
              ? "bg-aegean text-white"
              : "bg-surface-lowest ghost-border text-on-surface-variant hover:bg-surface-low"
          }`}
        >
          {t("allProducts")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? "bg-aegean text-white"
                : "bg-surface-lowest ghost-border text-on-surface-variant hover:bg-surface-low"
            }`}
          >
            {cat.nameEn}
          </button>
        ))}
      </div>

      {/* Product table */}
      <div className="bg-surface-lowest rounded-xl shadow-aegean overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">
            {tc("loading")}
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">
            {tc("noResults")}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              <div className="col-span-4">{t("productName")}</div>
              <div className="col-span-1">{t("sku")}</div>
              <div className="col-span-2">{t("category")}</div>
              <div className="col-span-1">{t("price")}</div>
              <div className="col-span-2">{t("stockLevel")}</div>
              <div className="col-span-1">{t("status")}</div>
              <div className="col-span-1">{t("actions")}</div>
            </div>

            {/* Rows */}
            {products.map((product, idx) => {
              const status = getStockStatus(product.variants);
              return (
                <div
                  key={product.id}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center ${
                    idx % 2 === 1 ? "bg-surface-low" : ""
                  }`}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover w-12 h-12"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-surface-high rounded-lg" />
                    )}
                    <div>
                      <p className="font-medium text-on-surface">{product.title}</p>
                      <p className="text-xs text-on-surface-variant">
                        {product.variants[0]?.label}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-1 text-sm text-on-surface-variant">
                    {product.variants[0]?.sku || "-"}
                  </div>
                  <div className="col-span-2">
                    <span className="px-2 py-1 text-xs font-medium bg-aegean-50 text-aegean rounded">
                      {product.category.nameEn}
                    </span>
                  </div>
                  <div className="col-span-1 text-sm font-medium">
                    &euro;{getLowestPrice(product.variants).toFixed(2)}
                  </div>
                  <div className="col-span-2 text-sm text-on-surface-variant">
                    {getTotalStock(product.variants)} units
                  </div>
                  <div className="col-span-1">
                    <span className={`text-sm font-medium ${status.color}`}>
                      &bull; {status.label}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center gap-1">
                    <button
                      onClick={() => openEdit(product)}
                      className="p-2 rounded-lg hover:bg-surface-low text-aegean transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 text-sm text-on-surface-variant">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg ghost-border hover:bg-surface-low disabled:opacity-50"
                >
                  {tc("previous")}
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg ghost-border hover:bg-surface-low disabled:opacity-50"
                >
                  {tc("next")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-surface-lowest max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editing ? "Edit Product" : t("addNewProduct")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title (English)</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  className="bg-surface-high ghost-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Title (Greek)</Label>
                <Input
                  value={form.titleEl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, titleEl: e.target.value }))
                  }
                  className="bg-surface-high ghost-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Description (English)</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="bg-surface-high ghost-border"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Greek)</Label>
                <Textarea
                  value={form.descriptionEl}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      descriptionEl: e.target.value,
                    }))
                  }
                  className="bg-surface-high ghost-border"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("category")}</Label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, categoryId: e.target.value }))
                }
                required
                className="w-full h-10 px-3 text-sm bg-surface-high ghost-border rounded-lg focus:outline-none"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parent ? `${cat.parent.nameEn} → ` : ""}{cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Variants */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Variants</Label>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-aegean hover:bg-aegean-50 rounded-lg transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add Variant
                </button>
              </div>

              {form.variants.map((variant, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-surface-low rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-on-surface-variant">
                      Variant {idx + 1}
                    </span>
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="p-1 hover:bg-red-50 rounded text-on-surface-variant hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={variant.label}
                        onChange={(e) =>
                          updateVariant(idx, "label", e.target.value)
                        }
                        required
                        placeholder="e.g. 500ml Bottle"
                        className="bg-surface-lowest ghost-border text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">SKU</Label>
                      <Input
                        value={variant.sku || ""}
                        onChange={(e) =>
                          updateVariant(idx, "sku", e.target.value)
                        }
                        placeholder="e.g. OIL-500"
                        className="bg-surface-lowest ghost-border text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price (&euro;)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(idx, "price", parseFloat(e.target.value) || 0)
                        }
                        required
                        className="bg-surface-lowest ghost-border text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(idx, "stock", parseInt(e.target.value) || 0)
                        }
                        required
                        className="bg-surface-lowest ghost-border text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
