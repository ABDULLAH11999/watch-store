"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatPKR } from "@/lib/utils";
import { MediaImage } from "@/components/media-image";

type Product = {
  id: string;
  name: string;
  brand: string;
  price: string;
  salePrice: string | null;
  images: string[];
  stock: number;
  status: string;
  slug: string;
};

export function ProductTable({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = products.filter((product) => {
    const query = search.toLowerCase();
    return !query || product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query) || product.slug.toLowerCase().includes(query);
  });

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedProducts = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

  useEffect(() => setPage(1), [search]);

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(data.error || "Unable to delete product");
      return;
    }
    toast.success("Product deleted");
    setProducts((current) => current.filter((item) => item.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-5 rounded-3xl border border-black/10 bg-white p-4 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">Catalog</p>
          <h2 className="mt-2 font-heading text-2xl sm:text-3xl">Products</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            className="w-full rounded-2xl border border-black/10 px-4 py-3 sm:min-w-[260px] md:max-w-xs"
          />
          <Link href="/admin/products/new" className="w-full shrink-0 rounded-2xl bg-black px-4 py-3 text-center text-sm font-semibold text-white sm:w-auto">
            New Product
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {pagedProducts.map((product) => (
          <div key={product.id} className="rounded-3xl border border-black/10 p-4">
            <div className="flex gap-3">
              <div className="h-18 w-18 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-black/5 sm:h-20 sm:w-20">
                {product.images?.[0] ? <MediaImage src={product.images[0]} alt={product.name} width={80} height={80} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold sm:text-base">{product.name}</p>
                <p className="mt-1 text-xs text-black/45">{product.slug}</p>
                <p className="mt-2 text-sm text-black/60">{product.brand}</p>
                <p className="mt-1 text-sm font-semibold">{formatPKR(product.price)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold">{product.status}</span>
              <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold">Stock {product.stock}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href={`/admin/products/${product.id}`} className="rounded-2xl border border-black px-3 py-3 text-center text-sm font-semibold">
                Edit
              </Link>
              <button onClick={() => remove(product.id)} className="rounded-2xl border border-black px-3 py-3 text-sm font-semibold text-black">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-black/10 lg:block">
        <div className="max-h-[720px] overflow-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
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
                      <div className="h-12 w-12 overflow-hidden rounded-2xl border border-black/10 bg-black/5">
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
                    <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">{product.status}</span>
                  </td>
                  <td className="px-4 py-4">{product.stock}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/${product.id}`} className="rounded-full border border-black px-3 py-2 text-xs font-semibold">
                        Edit
                      </Link>
                      <button onClick={() => remove(product.id)} className="rounded-full border border-black px-3 py-2 text-xs font-semibold">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-black/50">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-black/50">
          Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-full border border-black/10 px-3 py-2 font-semibold disabled:opacity-40">
            Prev
          </button>
          <span className="rounded-full bg-black/5 px-3 py-2 font-semibold text-black/70">
            {page} / {totalPages}
          </span>
          <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="rounded-full border border-black/10 px-3 py-2 font-semibold disabled:opacity-40">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
