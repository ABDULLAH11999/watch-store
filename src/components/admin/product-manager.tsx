"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/tiptap-editor";
import { useMediaUploader } from "@/components/media-uploader";
import { formatPKR } from "@/lib/utils";
import { MediaImage } from "@/components/media-image";

type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: string;
  salePrice: string | null;
  saleEndsAt: string | null;
  images: unknown;
  videoUrl: string | null;
  stock: number;
  status: string;
  slug: string;
};

const emptyForm = {
  name: "",
  brand: "",
  description: "<p></p>",
  price: "",
  salePrice: "",
  saleEndsAt: "",
  images: [] as string[],
  videoUrl: "",
  stock: "0",
  status: "DRAFT"
};

export function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { uploadFiles, uploading } = useMediaUploader("anmol-gadgets/watches");

  useEffect(() => {
    if (!selected) {
      setForm(emptyForm);
      return;
    }
    setForm({
      name: selected.name,
      brand: selected.brand,
      description: selected.description,
      price: String(selected.price),
      salePrice: selected.salePrice || "",
      saleEndsAt: selected.saleEndsAt ? selected.saleEndsAt.slice(0, 16) : "",
      images: (selected.images as string[]) || [],
      videoUrl: selected.videoUrl || "",
      stock: String(selected.stock),
      status: selected.status
    });
  }, [selected]);

  async function submit() {
    if (!form.images.length) {
      toast.error("Please upload at least one gallery image");
      return;
    }
    const payload = {
      ...form,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      saleEndsAt: form.saleEndsAt ? new Date(form.saleEndsAt).toISOString() : null,
      images: form.images,
      videoUrl: form.videoUrl || null,
      stock: Number(form.stock),
      status: form.status
    };
    const response = await fetch(`/api/admin/products${selected ? `/${selected.id}` : ""}`, {
      method: selected ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(data.error || "Unable to save product");
      return;
    }
    toast.success("Product saved");
    const next = selected
      ? products.map((item) => (item.id === selected.id ? data.item : item))
      : [data.item, ...products];
    setProducts(next);
    setSelected(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete product");
      return;
    }
    setProducts(products.filter((product) => product.id !== id));
    toast.success("Product deleted");
  }

  async function handleUpload(files: FileList | null) {
    const urls = await uploadFiles(files);
    if (urls.length) setForm((current) => ({ ...current, images: [...current.images, ...urls] }));
  }

  function removeImage(image: string) {
    setForm((current) => ({ ...current, images: current.images.filter((url) => url !== image) }));
  }

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase();
    return !query || product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query) || product.slug.toLowerCase().includes(query);
  });
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pagedProducts = useMemo(() => filteredProducts.slice((page - 1) * pageSize, page * pageSize), [filteredProducts, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-3xl">{selected ? "Edit Product" : "Add Product"}</h2>
          {selected && (
            <button className="text-sm text-black/60" onClick={() => setSelected(null)}>
              Cancel
            </button>
          )}
        </div>
        <div className="grid gap-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-2xl border px-4 py-3" />
          <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand" className="rounded-2xl border px-4 py-3" />
          <TiptapEditor value={form.description} onChange={(description) => setForm({ ...form, description })} />
          <div className="grid gap-3 md:grid-cols-2">
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="rounded-2xl border px-4 py-3" />
            <input value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} placeholder="Sale price" className="rounded-2xl border px-4 py-3" />
            <input value={form.saleEndsAt} type="datetime-local" onChange={(e) => setForm({ ...form, saleEndsAt: e.target.value })} className="rounded-2xl border px-4 py-3" />
            <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="rounded-2xl border px-4 py-3" />
          </div>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-2xl border px-4 py-3">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
          </select>
          <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="Video URL (optional)" className="rounded-2xl border px-4 py-3" />
          <label className="rounded-2xl border border-dashed p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-black/60">Upload gallery images</span>
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
          <button onClick={submit} className="rounded-2xl bg-black px-4 py-3 font-semibold text-white">
            {selected ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="font-heading text-3xl">Products</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            className="w-full rounded-2xl border px-4 py-3 md:max-w-xs"
          />
        </div>
        <div className="overflow-hidden rounded-3xl border border-black/10">
          <div className="max-h-[720px] overflow-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="sticky top-0 bg-white text-black/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedProducts.map((product) => (
                  <tr key={product.id} className="border-t border-black/5">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-2xl bg-black/5">
                          {product.images?.[0] ? (
                            <MediaImage src={product.images[0]} alt={product.name} width={48} height={48} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-black">{product.name}</p>
                          <p className="text-xs text-black/45">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{product.brand}</td>
                    <td className="px-4 py-4">{formatPKR(product.price)}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">{product.status}</span>
                    </td>
                    <td className="px-4 py-4">{product.stock}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelected(product)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold">
                          Edit
                        </button>
                        <button onClick={() => remove(product.id)} className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-black/50">
                      No products yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <p className="text-black/50">
            Showing {filteredProducts.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-full border border-black/10 px-3 py-2 font-semibold disabled:opacity-40"
            >
              Prev
            </button>
            <span className="rounded-full bg-black/5 px-3 py-2 font-semibold text-black/70">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-full border border-black/10 px-3 py-2 font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
