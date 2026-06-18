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

  function getImage(product: Product) {
    const images = Array.isArray(product.images) ? product.images : [];
    const firstImage = images.find((image): image is string => typeof image === "string" && image.trim().length > 0);
    return firstImage || "/ui-image/Logo.png";
  }

  async function submit() {
    const cleanCustomer = {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email.trim() || null,
      address: customer.address.trim(),
      city: customer.city.trim()
    };

    if (!cleanCustomer.name || !cleanCustomer.phone || !cleanCustomer.address || !cleanCustomer.city) {
      toast.error("Fill customer name, phone, address, and city");
      return;
    }

    const items = products
      .filter((product) => (quantities[product.id] || 0) > 0)
      .map((product) => ({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        slug: product.slug,
        image: getImage(product),
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
        customer: cleanCustomer,
        notes: notes.trim() || null,
        items
      })
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      const errorMessage = typeof data?.error === "string" && data.error.trim().length > 0 ? data.error : data?.issues ? "Please check the order form" : "Unable to create order";
      return toast.error(errorMessage);
    }
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
