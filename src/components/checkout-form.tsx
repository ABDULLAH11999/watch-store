"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/components/cart-context";
import { formatPKR } from "@/lib/utils";

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);

    const payload = {
      customer: {
        name: String(form.get("name") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || "") || null,
        address: String(form.get("address") || ""),
        city: String(form.get("city") || "")
      },
      notes: String(form.get("notes") || "") || null,
      items
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      toast.error(data.error || "Unable to place order");
      return;
    }

    toast.success("Order placed successfully");
    clearCart();
    router.push(`/order-success/${data.orderNumber}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <input name="name" required placeholder="Full Name *" className="rounded-2xl border border-black/10 px-4 py-3 outline-none" />
        <input name="phone" required placeholder="Phone *" className="rounded-2xl border border-black/10 px-4 py-3 outline-none" />
        <input name="email" type="email" placeholder="Email (optional)" className="rounded-2xl border border-black/10 px-4 py-3 outline-none" />
        <input name="city" required placeholder="City *" className="rounded-2xl border border-black/10 px-4 py-3 outline-none" />
      </div>
      <textarea name="address" required placeholder="Delivery Address *" rows={4} className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none" />
      <textarea name="notes" placeholder="Order Notes" rows={3} className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none" />
      <div className="rounded-2xl border border-dashed border-gold bg-[#fffaf0] px-4 py-3 font-semibold text-black">
        Cash on Delivery
      </div>
      <button disabled={loading || items.length === 0} className="w-full rounded-2xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60">
        {loading ? "Placing Order..." : `Place Order • ${formatPKR(subtotal)}`}
      </button>
    </form>
  );
}
