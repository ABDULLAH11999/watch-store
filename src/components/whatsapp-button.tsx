"use client";

import { Instagram, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  productName?: string;
  productUrl?: string;
};

export function WhatsAppButton({ productName, productUrl }: Props) {
  const [phone, setPhone] = useState("");
  const [instagramLink, setInstagramLink] = useState("");

  useEffect(() => {
    fetch("/api/settings/business")
      .then((response) => response.json())
      .then((data) => {
        setPhone(data.whatsappNumber || data.contactPhone || "");
        setInstagramLink(data.instagramLink || "");
      })
      .catch(() => {
        setPhone("");
        setInstagramLink("");
      });
  }, []);

  const message = productName
    ? `I want to order ${productName}${productUrl ? ` - ${productUrl}` : ""}`
    : "I want to learn more about Anmol Gadgets watches";

  const href = phone ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}` : "#";

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      {instagramLink ? (
        <a
          href={instagramLink}
          target="_blank"
          rel="noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white shadow-2xl transition hover:scale-105"
          aria-label="Instagram"
        >
          <Instagram className="h-7 w-7" />
        </a>
      ) : null}
      {phone ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition hover:scale-105"
          aria-label="WhatsApp"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" />
          <MessageCircle className="relative h-7 w-7" />
        </a>
      ) : null}
    </div>
  );
}
