"use client";

import { formatPKR } from "@/lib/utils";
import { Trash2, X } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  total: string;
  customer: { name: string; phone: string; email?: string | null; address?: string; city?: string };
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
};

export function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  onDelete
}: {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
}) {
  if (!order) return null;
  const steps = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-black/45">Order Detail</p>
            <h2 className="font-heading text-3xl">{order.orderNumber}</h2>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-black/10 p-4">
            <h3 className="font-heading text-2xl">Customer</h3>
            <div className="mt-3 space-y-2 text-sm text-black/70">
              <p>{order.customer.name}</p>
              <p>{order.customer.phone}</p>
              <p>{order.customer.email || "No email"}</p>
              <p>{order.customer.address || "No address"}</p>
              <p>{order.customer.city || "No city"}</p>
              <p><span className="rounded-full border border-black/10 px-3 py-1 font-semibold text-black">Cash on Delivery</span></p>
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 p-4">
            <h3 className="font-heading text-2xl">Status Timeline</h3>
            <div className="mt-3 space-y-2">
              {steps.map((step) => (
                <div key={step} className={`rounded-2xl px-3 py-2 text-sm ${order.status === step ? "bg-black text-white" : "bg-black/5"}`}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-black/10 p-4">
          <h3 className="font-heading text-2xl">Items</h3>
          <div className="mt-4 space-y-3">
            {order.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-center justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>{formatPKR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4 font-semibold">
            <span>Total</span>
            <span>{formatPKR(Number(order.total))}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <select value={order.status} onChange={(e) => onUpdateStatus(order.id, e.target.value)} className="rounded-2xl border px-4 py-3">
            {steps.map((step) => (
              <option key={step} value={step}>{step}</option>
            ))}
          </select>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(order.id)}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-500 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
