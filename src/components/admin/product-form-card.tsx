"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TiptapEditor } from "@/components/tiptap-editor";
import { useMediaUploader } from "@/components/media-uploader";
import { toSlug } from "@/lib/utils";
import { MediaImage } from "@/components/media-image";

type ProductInput = {
  id?: string;
  name: string;
  brand: string;
  description: string;
  price: string;
  salePrice: string | null;
  saleEndsAt: string | null;
  images: string[];
  videoUrl: string | null;
  stock: number;
  status: "DRAFT" | "PUBLISHED" | "OUT_OF_STOCK";
  slug?: string;
};

const emptyForm: ProductInput = {
  name: "",
  brand: "",
  description: "<p></p>",
  price: "",
  salePrice: "",
  saleEndsAt: "",
  images: [],
  videoUrl: "",
  stock: 0,
  status: "DRAFT"
};

export function ProductFormCard({
  initialProduct
}: {
  initialProduct?: ProductInput | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductInput>(initialProduct ?? emptyForm);
  const { uploadFiles, uploading } = useMediaUploader("anmol-gadgets/watches");

  const isEdit = Boolean(initialProduct?.id);
  const slugPreview = useMemo(() => form.slug || toSlug(form.name || "product"), [form.name, form.slug]);

  async function handleUpload(files: FileList | null) {
    const urls = await uploadFiles(files);
    if (urls.length) setForm((current) => ({ ...current, images: [...current.images, ...urls] }));
  }

  function removeImage(image: string) {
    setForm((current) => ({ ...current, images: current.images.filter((url) => url !== image) }));
  }

  async function save() {
    if (!form.images.length) {
      toast.error("Please upload at least one gallery image");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      brand: form.brand,
      description: form.description,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      saleEndsAt: form.saleEndsAt ? new Date(form.saleEndsAt).toISOString() : null,
      images: form.images,
      videoUrl: form.videoUrl || null,
      stock: Number(form.stock),
      status: form.status
    };

    const response = await fetch(`/api/admin/products${isEdit ? `/${form.id}` : ""}`, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(data.error || "Unable to save product");
      return;
    }

    toast.success(isEdit ? "Product updated" : "Product created");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">{isEdit ? "Edit Product" : "Create Product"}</p>
          <h1 className="mt-2 font-heading text-3xl md:text-5xl">{isEdit ? "Update Catalog Entry" : "New Catalog Entry"}</h1>
        </div>
          <a href="/admin/products" className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold">
            Back to Products
          </a>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-2xl">Basic Information</h2>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-black/60">Product Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-2xl border px-4 py-3" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-black/60">Brand</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="rounded-2xl border px-4 py-3" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-black/60">Slug</label>
                <div className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/60">{slugPreview}</div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-2xl">Description</h2>
            <div className="mt-4">
              <TiptapEditor
                value={form.description}
                onChange={(description) => setForm((current) => ({ ...current, description }))}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-2xl">Pricing & Status</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-black/60">Price</label>
                <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-2xl border px-4 py-3" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-black/60">Sale Price</label>
                <input value={form.salePrice || ""} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="rounded-2xl border px-4 py-3" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-black/60">Sale Ends At</label>
                <input
                  type="datetime-local"
                  value={form.saleEndsAt || ""}
                  onChange={(e) => setForm({ ...form, saleEndsAt: e.target.value })}
                  className="rounded-2xl border px-4 py-3"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-black/60">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="rounded-2xl border px-4 py-3"
                />
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <label className="text-sm font-medium text-black/60">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProductInput["status"] })} className="rounded-2xl border px-4 py-3">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
              </select>
            </div>
          </section>

          <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-2xl">Media</h2>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-black/60">Video URL</label>
                <input
                  value={form.videoUrl || ""}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="Optional"
                  className="rounded-2xl border px-4 py-3"
                />
              </div>
              <label className="rounded-2xl border border-dashed p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-black/60">Gallery images</span>
                  <span className="text-xs text-black/40">{uploading ? "Uploading..." : "Cloudinary"}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={(e) => handleUpload(e.target.files)} className="w-full text-sm" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
                  >
                    Add More Images
                  </button>
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {form.images.map((image) => (
                  <div key={image} className="relative overflow-hidden rounded-2xl border">
                    <MediaImage src={image} alt="uploaded" width={200} height={200} className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(image)}
                      className="absolute right-2 top-2 rounded-full bg-black/80 px-2 py-1 text-[10px] font-semibold text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

            <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-black px-4 py-4 font-semibold text-white transition hover:bg-black/90 disabled:opacity-60">
              {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </button>
        </div>
      </div>
    </div>
  );
}
