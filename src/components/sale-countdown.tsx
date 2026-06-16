"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "anmol-gadgets-sale-start";
const SALE_WINDOW_MS = 45 * 60 * 1000;

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function getSessionStart() {
  if (typeof window === "undefined") return Date.now();
  const stored = window.sessionStorage.getItem(SESSION_KEY);
  const parsed = stored ? Number(stored) : Number.NaN;
  if (!stored || Number.isNaN(parsed)) {
    const now = Date.now();
    window.sessionStorage.setItem(SESSION_KEY, String(now));
    return now;
  }
  return parsed;
}

export function SaleCountdown() {
  const [label, setLabel] = useState("00:45:00");

  useEffect(() => {
    const tick = () => {
      const start = getSessionStart();
      const elapsed = Date.now() - start;
      if (elapsed >= SALE_WINDOW_MS) {
        const now = Date.now();
        window.sessionStorage.setItem(SESSION_KEY, String(now));
        setLabel(formatTime(SALE_WINDOW_MS));
        return;
      }
      setLabel(formatTime(SALE_WINDOW_MS - elapsed));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-600">
      <span className="animate-pulse">Sale ends in</span>
      <span className="font-mono font-semibold">{label}</span>
    </span>
  );
}
