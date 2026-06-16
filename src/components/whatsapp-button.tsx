"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  productName?: string;
  productUrl?: string;
};

export function WhatsAppButton({ productName, productUrl }: Props) {
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch("/api/settings/business")
      .then((response) => response.json())
      .then((data) => setPhone(data.whatsappNumber || data.contactPhone || ""))
      .catch(() => setPhone(""));
  }, []);

  const message = productName
    ? `I want to order ${productName}${productUrl ? ` — ${productUrl}` : ""}`
    : "I want to learn more about Anmol Gadgets watches";

  const href = phone ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}` : "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition hover:scale-105"
      aria-label="WhatsApp"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" />
      <MessageCircle className="relative h-7 w-7" />
    </a>
  );
}
