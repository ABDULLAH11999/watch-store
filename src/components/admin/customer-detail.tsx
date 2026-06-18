"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { formatPKR } from "@/lib/utils";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
};

type Order = {
  orderNumber: string;
  total: string;
  status: string;
  createdAt: string;
};

export function CustomerDetail({ customer, orders }: { customer: Customer; orders: Order[] }) {
  const [form, setForm] = useState(customer);

  async function save() {
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email?.trim() || null,
      address: form.address.trim(),
      city: form.city.trim()
    };

    if (!payload.name || !payload.phone || !payload.address || !payload.city) {
      toast.error("Fill customer name, phone, address, and city");
      return;
    }

    const response = await fetch(`/api/admin/customers/${customer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return toast.error("Unable to save customer");
    toast.success("Customer updated");
  }

  const lifetimeSpend = orders.reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-3xl">Edit Customer</h2>
        <div className="mt-4 grid gap-3">
          {(["name", "phone", "email", "address", "city"] as const).map((field) => (
            <input
              key={field}
              value={form[field] || ""}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              placeholder={field}
              className="rounded-2xl border px-4 py-3"
            />
          ))}
          <button onClick={save} className="rounded-2xl bg-black px-4 py-3 font-semibold text-white">
            Save Customer
          </button>
        </div>
      </div>
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-3xl">Order History</h2>
        <p className="mt-3 text-sm text-black/60">Lifetime spend: {formatPKR(lifetimeSpend)}</p>
        <div className="mt-5 space-y-3">
          {orders.map((order) => (
            <div key={order.orderNumber} className="flex items-center justify-between rounded-2xl border border-black/10 p-4 text-sm">
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-black/50">{new Date(order.createdAt).toLocaleDateString()} | {order.status}</p>
              </div>
              <div>{formatPKR(Number(order.total))}</div>
            </div>
          ))}
          {orders.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-black/50">No orders found.</div>}
        </div>
      </div>
    </div>
  );
}
