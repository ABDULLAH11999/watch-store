"use client";

import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

type BusinessInfo = {
  contactPhone?: string;
  contactEmail?: string;
  shopAddress?: string;
  whatsappNumber?: string;
};

export default function ContactPage() {
  const [business, setBusiness] = useState<BusinessInfo>({
    contactPhone: "",
    contactEmail: "",
    shopAddress: "",
    whatsappNumber: ""
  });

  useEffect(() => {
    fetch("/api/settings/business")
      .then((response) => response.json())
      .then((data) => setBusiness(data))
      .catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
      <p className="text-sm uppercase tracking-[0.4em] text-gold">Contact</p>
      <h1 className="mt-3 font-heading text-5xl">Get in touch</h1>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-3xl">Business Info</h2>
          <div className="mt-4 space-y-3 text-black/70">
            <p>
              <strong>Phone:</strong> {business.contactPhone || "Phone not set"}
            </p>
            <p>
              <strong>Email:</strong> {business.contactEmail || "Email not set"}
            </p>
            <p>
              <strong>Address:</strong> {business.shopAddress || "Address not set"}
            </p>
          </div>
          <a
            href={`https://wa.me/${String(business.whatsappNumber || business.contactPhone || "").replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white"
          >
            WhatsApp Us
          </a>
        </div>
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          <div className="aspect-video bg-zinc-100">
            <iframe title="Google Maps" className="h-full w-full" src="https://www.google.com/maps?q=Karachi&output=embed" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
}
