"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { formatPKR } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  brand: string;
  slug: string;
  price: string;
  salePrice: string | null;
  images: unknown;
};

export function OrderCreateForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", address: "", city: "" });
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const items = products
      .filter((product) => (quantities[product.id] || 0) > 0)
      .map((product) => ({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        slug: product.slug,
        image: (product.images as string[])?.[0] || "",
        quantity: quantities[product.id] || 1,
        price: Number(product.salePrice ?? product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null
      }));

    if (!items.length) return toast.error("Add at least one product");
    setLoading(true);
    const response = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { ...customer, email: customer.email || null },
        notes,
        items
      })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return toast.error(data.error || "Unable to create order");
    toast.success("Order created");
    router.push(`/admin/orders`);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-3xl">Customer Details</h2>
        <div className="mt-4 grid gap-3">
          {(["name", "phone", "email", "address", "city"] as const).map((field) => (
            <input
              key={field}
              value={customer[field]}
              onChange={(e) => setCustomer({ ...customer, [field]: e.target.value })}
              placeholder={field}
              className="rounded-2xl border px-4 py-3"
            />
          ))}
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Order notes" rows={4} className="rounded-2xl border px-4 py-3" />
          <button onClick={submit} disabled={loading} className="rounded-2xl bg-black px-4 py-3 font-semibold text-white">
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </div>
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-3xl">Products</h2>
        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between rounded-2xl border border-black/10 p-4">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-black/50">{product.brand} | {formatPKR(Number(product.salePrice ?? product.price))}</p>
              </div>
              <input
                type="number"
                min="0"
                value={quantities[product.id] || 0}
                onChange={(e) => setQuantities({ ...quantities, [product.id]: Number(e.target.value) })}
                className="w-24 rounded-2xl border px-4 py-2"
              />
            </div>
          ))}
          {products.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-black/50">No published products available.</div>}
        </div>
      </div>
    </div>
  );
}
