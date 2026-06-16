"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPKR } from "@/lib/utils";

export function OrderSummary({
  items,
  subtotal,
  onUpdateQuantity,
  onRemoveItem
}: {
  items: Array<{ name: string; quantity: number; price: number; salePrice?: number | null }>;
  subtotal: number;
  onUpdateQuantity?: (index: number, quantity: number) => void;
  onRemoveItem?: (index: number) => void;
}) {
  return (
    <aside className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="font-heading text-2xl sm:text-3xl">Order Summary</h2>
      <div className="mt-5 space-y-3 sm:mt-6">
        {items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="rounded-2xl border border-black/10 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium sm:text-base">{item.name}</p>
                <p className="mt-1 text-xs text-black/50">Qty: {item.quantity}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold">{formatPKR((item.salePrice ?? item.price) * item.quantity)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="inline-flex items-center rounded-full border border-black/10 bg-white">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity?.(index, item.quantity - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-black hover:text-white disabled:opacity-40"
                  disabled={!onUpdateQuantity}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 px-2 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity?.(index, item.quantity + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-black hover:text-white disabled:opacity-40"
                  disabled={!onUpdateQuantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onRemoveItem?.(index)}
                className="inline-flex items-center gap-2 rounded-full border border-black px-3 py-2 text-xs font-semibold transition hover:bg-black hover:text-white disabled:opacity-40"
                disabled={!onRemoveItem}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-base font-semibold sm:mt-6 sm:text-lg">
        <span>Total</span>
        <span>{formatPKR(subtotal)}</span>
      </div>
    </aside>
  );
}
