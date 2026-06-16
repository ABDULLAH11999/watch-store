 "use client";

import { formatPKR } from "@/lib/utils";

export function OrderSummary({
  items,
  subtotal
}: {
  items: Array<{ name: string; quantity: number; price: number; salePrice?: number | null }>;
  subtotal: number;
}) {
  return (
    <aside className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-3xl">Order Summary</h2>
      <div className="mt-6 space-y-3">
        {items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-black/50">Qty: {item.quantity}</p>
            </div>
            <span>{formatPKR((item.salePrice ?? item.price) * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border-t pt-4 text-lg font-semibold">
        <span>Total</span>
        <span>{formatPKR(subtotal)}</span>
      </div>
    </aside>
  );
}
