"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMediaUploader } from "@/components/media-uploader";
import { MediaImage } from "@/components/media-image";

type Testimonial = {
  id: string;
  customerName: string;
  customerImage: string;
  rating: number;
  reviewText: string;
  status: string;
  sortOrder: number;
};

const emptyForm = { customerName: "", customerImage: "", rating: "5", reviewText: "", status: "DRAFT", sortOrder: "0" };

export function TestimonialManager({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { uploadFiles, uploading } = useMediaUploader("anmol-gadgets/testimonials");

  useEffect(() => {
    if (selected) {
      setForm({
        customerName: selected.customerName,
        customerImage: selected.customerImage,
        rating: String(selected.rating),
        reviewText: selected.reviewText,
        status: selected.status,
        sortOrder: String(selected.sortOrder)
      });
    } else {
      setForm(emptyForm);
    }
  }, [selected]);

  async function save() {
    if (!form.customerName.trim()) {
      toast.error("Please enter a customer name");
      return;
    }
    if (!form.customerImage.trim()) {
      toast.error("Please upload a testimonial image");
      return;
    }
    const payload = {
      customerName: form.customerName.trim(),
      customerImage: form.customerImage.trim(),
      rating: Number(form.rating || 5),
      reviewText: form.reviewText.trim(),
      status: form.status || "DRAFT",
      sortOrder: Number(form.sortOrder || 0)
    };
    const response = await fetch(`/api/admin/testimonials${selected ? `/${selected.id}` : ""}`, {
      method: selected ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return toast.error(data.error || "Unable to save testimonial");
    toast.success("Testimonial saved");
    setTestimonials(selected ? testimonials.map((item) => (item.id === selected.id ? data.item : item)) : [data.item, ...testimonials]);
    setSelected(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete testimonial?")) return;
    const response = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Unable to delete testimonial");
    setTestimonials(testimonials.filter((item) => item.id !== id));
  }

  const filteredTestimonials = testimonials.filter((item) => {
    const query = search.toLowerCase();
    return !query || item.customerName.toLowerCase().includes(query) || item.status.toLowerCase().includes(query);
  });
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredTestimonials.length / pageSize));
  const pagedTestimonials = useMemo(() => filteredTestimonials.slice((page - 1) * pageSize, page * pageSize), [filteredTestimonials, page]);

  useEffect(() => setPage(1), [search]);

  return (
    <div className="space-y-5 rounded-3xl border border-black/10 bg-white p-4 shadow-sm lg:p-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="font-heading text-2xl sm:text-3xl">{selected ? "Edit Testimonial" : "Add Testimonial"}</h2>
          <div className="mt-4 grid gap-3">
            <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Customer Name" className="rounded-2xl border border-black/10 px-4 py-3" />
            <input value={form.customerImage} onChange={(e) => setForm({ ...form, customerImage: e.target.value })} placeholder="Image URL" className="rounded-2xl border border-black/10 px-4 py-3" />
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
              const urls = await uploadFiles(e.target.files);
              if (urls[0]) setForm({ ...form, customerImage: urls[0] });
              }}
              className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
            />
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="rounded-2xl border border-black/10 px-4 py-3">
              {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} Stars</option>)}
            </select>
            <textarea value={form.reviewText} onChange={(e) => setForm({ ...form, reviewText: e.target.value })} placeholder="Review (optional)" rows={5} className="rounded-2xl border border-black/10 px-4 py-3" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-2xl border border-black/10 px-4 py-3">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <input value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} placeholder="Sort order" className="rounded-2xl border border-black/10 px-4 py-3" />
            <button onClick={save} className="rounded-2xl bg-black px-4 py-3 font-semibold text-white">
              {uploading ? "Uploading..." : selected ? "Update Testimonial" : "Save Testimonial"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="font-heading text-2xl sm:text-3xl">Testimonials</h2>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search testimonials" className="w-full rounded-2xl border border-black/10 px-4 py-3 md:max-w-xs" />
          </div>

          <div className="grid gap-4 lg:hidden">
            {pagedTestimonials.map((item) => (
              <div key={item.id} className="rounded-3xl border border-black/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl border border-black/10 bg-black/5 sm:h-16 sm:w-16">
                    <MediaImage src={item.customerImage} alt={item.customerName} width={64} height={64} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold sm:text-base">{item.customerName}</p>
                    <p className="mt-1 text-sm leading-6 text-black/55 line-clamp-2">{item.reviewText}</p>
                    <p className="mt-2 text-xs text-black/45">Rating {item.rating} / 5</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => setSelected(item)} className="rounded-2xl border border-black px-3 py-3 text-sm font-semibold">
                    Edit
                  </button>
                  <button onClick={() => remove(item.id)} className="rounded-2xl border border-black px-3 py-3 text-sm font-semibold">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-black/10 lg:block">
            <div className="max-h-[720px] overflow-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="sticky top-0 bg-white text-black/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Testimonial</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Sort</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedTestimonials.map((item) => (
                    <tr key={item.id} className="border-t border-black/5">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                            <MediaImage src={item.customerImage} alt={item.customerName} width={48} height={48} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium">{item.customerName}</p>
                            <p className="max-w-sm truncate text-xs text-black/45">{item.reviewText}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{item.rating} / 5</td>
                      <td className="px-4 py-4">{item.status}</td>
                      <td className="px-4 py-4">{item.sortOrder}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setSelected(item)} className="rounded-full border border-black px-3 py-2 text-xs font-semibold">
                            Edit
                          </button>
                          <button onClick={() => remove(item.id)} className="rounded-full border border-black px-3 py-2 text-xs font-semibold">
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
              Showing {filteredTestimonials.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredTestimonials.length)} of {filteredTestimonials.length}
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
