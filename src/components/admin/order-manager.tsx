"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { formatPKR } from "@/lib/utils";
import { OrderDetailModal } from "@/components/admin/order-detail-modal";
import { Trash2 } from "lucide-react";

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
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return toast.error(data.error || "Unable to update order");
    setOrders((current) => current.map((order) => (order.id === id ? data.item : order)));
    toast.success("Order updated");
  }

  async function removeOrder(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    const response = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return toast.error(data.error || "Unable to delete order");

    setOrders((current) => current.filter((order) => order.id !== id));
    setSelected((current) => (current?.id === id ? null : current));
    toast.success("Order deleted");
  }

  const filteredOrders = orders.filter((order) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || order.orderNumber.toLowerCase().includes(query) || order.customer.name.toLowerCase().includes(query) || order.customer.phone.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pagedOrders = useMemo(() => filteredOrders.slice((page - 1) * pageSize, page * pageSize), [filteredOrders, page]);

  useEffect(() => setPage(1), [search, statusFilter]);

  return (
    <div className="space-y-5 rounded-3xl border border-black/10 bg-white p-4 shadow-sm lg:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">Sales</p>
          <h2 className="mt-2 font-heading text-2xl sm:text-3xl">Orders</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders" className="w-full rounded-2xl border border-black/10 px-4 py-3 sm:min-w-[220px] md:w-72" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-2xl border border-black/10 px-4 py-3 sm:min-w-[180px] md:w-48">
            <option value="ALL">All Status</option>
            {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <a href="/api/admin/orders/export" className="w-full rounded-2xl bg-black px-4 py-3 text-center text-sm font-semibold text-white sm:w-auto">
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {pagedOrders.map((order) => (
          <div key={order.id} className="rounded-3xl border border-black/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="mt-1 text-sm text-black/55">{order.customer.name}</p>
                <p className="text-xs text-black/45">{order.customer.phone}</p>
              </div>
              <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold">{order.status}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>Total</span>
              <span className="font-semibold">{formatPKR(order.total)}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="rounded-2xl border border-black/10 px-4 py-3 text-sm">
                {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button onClick={() => setSelected(order)} className="rounded-2xl border border-black px-3 py-3 text-sm font-semibold">
                View
              </button>
              <button
                onClick={() => removeOrder(order.id)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500 px-3 py-3 text-sm font-semibold text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-black/10 lg:block">
        <div className="max-h-[760px] overflow-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="sticky top-0 bg-white text-black/50">
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
                    <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="rounded-2xl border border-black/10 px-3 py-2 text-xs">
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
                      <button onClick={() => setSelected(order)} className="rounded-full border border-black px-3 py-2 text-xs font-semibold">
                        View
                      </button>
                      <button
                        onClick={() => removeOrder(order.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-500 px-3 py-2 text-xs font-semibold text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-black/50">
          Showing {filteredOrders.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length}
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

      <OrderDetailModal order={selected} onClose={() => setSelected(null)} onUpdateStatus={updateStatus} onDelete={removeOrder} />
    </div>
  );
}
