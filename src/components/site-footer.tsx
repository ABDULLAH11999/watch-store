"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";

type BusinessInfo = {
  contactPhone?: string;
  contactEmail?: string;
  shopAddress?: string;
  whatsappNumber?: string;
  instagramLink?: string;
};

export function SiteFooter() {
  const [business, setBusiness] = useState<BusinessInfo>({
    contactPhone: "",
    contactEmail: "",
    shopAddress: "",
    whatsappNumber: "",
    instagramLink: ""
  });

  useEffect(() => {
    fetch("/api/settings/business")
      .then((response) => response.json())
      .then((data) => setBusiness(data))
      .catch(() => undefined);
  }, []);

  return (
    <footer className="border-t border-black/10 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <div className="font-heading text-3xl text-gold">Anmol Gadgets</div>
          <p className="max-w-sm text-sm leading-6 text-white/70">
            Pakistan's premium destination for luxury Swiss timepieces, curated with authenticity and white-glove service.
          </p>
        </div>
        <div>
          <h3 className="mb-4 font-heading text-xl text-gold">Explore</h3>
          <div className="flex flex-col gap-2 text-sm text-white/75">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/return-policy">Return Policy</Link>
            <Link href="/terms-conditions">Terms</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-heading text-xl text-gold">Business Info</h3>
          <div className="space-y-2 text-sm text-white/75">
            <p>{business.contactPhone || "Phone not set"}</p>
            <p>{business.contactEmail || "Email not set"}</p>
            <p>{business.shopAddress || "Address not set"}</p>
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-heading text-xl text-gold">Social</h3>
          <div className="flex gap-3 text-white/75">
            <Link href={business.instagramLink || "#"} aria-label="Instagram" target={business.instagramLink ? "_blank" : undefined} rel={business.instagramLink ? "noreferrer" : undefined}>
              <Instagram />
            </Link>
            <Link
              href={
                business.whatsappNumber
                  ? `https://wa.me/${String(business.whatsappNumber).replace(/\D/g, "")}`
                  : "#"
              }
              aria-label="WhatsApp"
              target={business.whatsappNumber ? "_blank" : undefined}
              rel={business.whatsappNumber ? "noreferrer" : undefined}
            >
              <MessageCircle />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Anmol Gadgets. All rights reserved.
      </div>
    </footer>
  );
}
