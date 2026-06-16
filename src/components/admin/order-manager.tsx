"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { formatPKR } from "@/lib/utils";
import { OrderDetailModal } from "@/components/admin/order-detail-modal";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  total: string;
  customer: { name: string; phone: string; email?: string | null };
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
};

export function OrderManager({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  async function updateStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || "Unable to update order");
    setOrders(orders.map((order) => (order.id === id ? data.item : order)));
    toast.success("Order updated");
  }

  async function resend(id: string) {
    const response = await fetch(`/api/admin/orders/${id}/resend`, { method: "POST" });
    if (!response.ok) return toast.error("Unable to resend");
    toast.success("Email resent");
  }

  const filteredOrders = orders.filter((order) => {
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      order.orderNumber.toLowerCase().includes(query) ||
      order.customer.name.toLowerCase().includes(query) ||
      order.customer.phone.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pagedOrders = useMemo(() => filteredOrders.slice((page - 1) * pageSize, page * pageSize), [filteredOrders, page]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="font-heading text-3xl">Orders</h2>
        <div className="flex flex-col gap-3 md:flex-row">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders" className="rounded-2xl border px-4 py-3 md:w-72" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-2xl border px-4 py-3 md:w-48">
            <option value="ALL">All Status</option>
            {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <a href="/api/admin/orders/export" className="rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white text-center">
            Export CSV
          </a>
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border border-black/10">
        <div className="max-h-[760px] overflow-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="sticky top-0 bg-[#faf7f2] text-black/50">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.map((order) => (
                <tr key={order.id} className="border-t border-black/5">
                  <td className="px-4 py-4 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-4">
                    <div>{order.customer.name}</div>
                    <div className="text-xs text-black/45">{order.customer.phone}</div>
                  </td>
                  <td className="px-4 py-4">{formatPKR(order.total)}</td>
                  <td className="px-4 py-4">
                    <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="rounded-2xl border px-3 py-2 text-xs">
                      {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelected(order)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold">
                        View
                      </button>
                      <button onClick={() => resend(order.id)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold">
                        Resend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-black/50">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <p className="text-black/50">
          Showing {filteredOrders.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length}
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
      <OrderDetailModal
        order={selected}
        onClose={() => setSelected(null)}
        onUpdateStatus={updateStatus}
        onResend={resend}
      />
    </div>
  );
}
