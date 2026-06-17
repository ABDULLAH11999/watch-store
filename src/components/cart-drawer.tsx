"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatPKR } from "@/lib/utils";
import { MediaImage } from "@/components/media-image";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-black/40 transition ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-heading text-2xl">Your Cart</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="max-h-[calc(100vh-180px)] space-y-4 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-black/15 p-8 text-center text-sm text-black/60">
              Your cart is empty. Explore collections to add a luxury watch.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3 rounded-3xl border border-black/10 p-3">
                <MediaImage src={item.image} alt={item.name} width={88} height={88} className="h-20 w-20 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-xs text-black/50">{item.brand}</p>
                  <p className="mt-1 text-sm font-semibold">{formatPKR(item.salePrice ?? item.price)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="rounded-full border p-1" onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button className="rounded-full border p-1" onClick={() => updateQuantity(item.productId, item.quantity + 1)}><Plus className="h-4 w-4" /></button>
                    <button className="ml-auto text-xs text-red-500" onClick={() => removeItem(item.productId)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t p-5">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPKR(subtotal)}</span>
          </div>
          <Link href="/checkout" onClick={onClose} className="block rounded-2xl bg-black px-4 py-3 text-center font-semibold text-white transition hover:bg-zinc-800">
            Proceed to Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
