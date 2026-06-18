"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  orders?: unknown[];
};

const emptyForm = { name: "", phone: "", email: "", address: "", city: "" };

export function CustomerManager({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name,
        phone: selected.phone,
        email: selected.email || "",
        address: selected.address,
        city: selected.city
      });
    } else {
      setForm(emptyForm);
    }
  }, [selected]);

  async function save() {
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim(),
      city: form.city.trim()
    };

    if (!payload.name || !payload.phone || !payload.address || !payload.city) {
      toast.error("Fill customer name, phone, address, and city");
      return;
    }

    const response = await fetch(`/api/admin/customers${selected ? `/${selected.id}` : ""}`, {
      method: selected ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return toast.error(data.error || "Unable to save customer");
    toast.success("Customer saved");
    setCustomers((current) => (selected ? current.map((item) => (item.id === selected.id ? data.item : item)) : [data.item, ...current]));
    setSelected(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete customer?")) return;
    const response = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Unable to delete customer");
    setCustomers(customers.filter((item) => item.id !== id));
  }

  const filteredCustomers = customers.filter((customer) => {
    const query = search.toLowerCase();
    return !query || customer.name.toLowerCase().includes(query) || customer.phone.toLowerCase().includes(query) || customer.city.toLowerCase().includes(query);
  });
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const pagedCustomers = useMemo(() => filteredCustomers.slice((page - 1) * pageSize, page * pageSize), [filteredCustomers, page]);

  useEffect(() => setPage(1), [search]);

  return (
    <div className="space-y-5 rounded-3xl border border-black/10 bg-white p-4 shadow-sm lg:p-6">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="font-heading text-2xl sm:text-3xl">{selected ? "Edit Customer" : "Add Customer"}</h2>
          <div className="mt-4 grid gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-2xl border border-black/10 px-4 py-3" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-2xl border border-black/10 px-4 py-3" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-2xl border border-black/10 px-4 py-3" />
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="rounded-2xl border border-black/10 px-4 py-3" />
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" rows={4} className="rounded-2xl border border-black/10 px-4 py-3" />
            <button onClick={save} className="rounded-2xl bg-black px-4 py-3 font-semibold text-white">
              {selected ? "Update Customer" : "Save Customer"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="font-heading text-2xl sm:text-3xl">Customers</h2>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers" className="w-full rounded-2xl border border-black/10 px-4 py-3 md:max-w-xs" />
          </div>

          <div className="grid gap-4 lg:hidden">
            {pagedCustomers.map((customer) => (
              <div key={customer.id} className="rounded-3xl border border-black/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="mt-1 text-sm text-black/55">{customer.phone}</p>
                    <p className="text-sm text-black/55">{customer.city}</p>
                    <p className="text-xs text-black/45">{customer.email || "—"}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Link href={`/admin/customers/${customer.id}`} className="rounded-2xl border border-black px-3 py-3 text-center text-sm font-semibold">
                    View
                  </Link>
                  <button onClick={() => setSelected(customer)} className="rounded-2xl border border-black px-3 py-3 text-sm font-semibold">
                    Edit
                  </button>
                  <button onClick={() => remove(customer.id)} className="rounded-2xl border border-black px-3 py-3 text-sm font-semibold">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-black/10 lg:block">
            <div className="max-h-[720px] overflow-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="sticky top-0 bg-white text-black/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">City</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedCustomers.map((customer) => (
                    <tr key={customer.id} className="border-t border-black/5">
                      <td className="px-4 py-4 font-medium">{customer.name}</td>
                      <td className="px-4 py-4">{customer.phone}</td>
                      <td className="px-4 py-4">{customer.city}</td>
                      <td className="px-4 py-4">{customer.email || "—"}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/customers/${customer.id}`} className="rounded-full border border-black px-3 py-2 text-xs font-semibold">
                            View
                          </Link>
                          <button onClick={() => setSelected(customer)} className="rounded-full border border-black px-3 py-2 text-xs font-semibold">
                            Edit
                          </button>
                          <button onClick={() => remove(customer.id)} className="rounded-full border border-black px-3 py-2 text-xs font-semibold">
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

          <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-black/50">
              Showing {filteredCustomers.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredCustomers.length)} of {filteredCustomers.length}
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
        </div>
      </div>
    </div>
  );
}
