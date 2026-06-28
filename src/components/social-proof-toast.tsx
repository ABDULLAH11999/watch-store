"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type ToastItem = {
  id: number;
  product: string;
  timeAgo: string;
};

export function SocialProofToast({ productTitles }: { productTitles: string[] }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const spawn = () => {
      if (!productTitles.length) return;
      const product = productTitles[Math.floor(Math.random() * productTitles.length)];
      setItems((current) => [
        {
          id: Date.now(),
          product,
          timeAgo: "2 min ago"
        },
        ...current
      ]);
    };

    spawn();
    const timer = setInterval(spawn, 30000);
    return () => clearInterval(timer);
  }, [productTitles]);

  useEffect(() => {
    const cleanup = setInterval(() => {
      setItems((current) => current.filter((item) => Date.now() - item.id < 5000));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="pointer-events-none fixed left-4 top-24 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {items.slice(0, 1).map((item) => (
          <motion.div
            key={item.id}
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-xl"
        >
          <div className="text-sm">
            <p className="font-medium text-ink">
              New arrival: {item.product}
            </p>
            <p className="text-xs text-black/50">{item.timeAgo}</p>
          </div>
        </motion.div>
      ))}
      </AnimatePresence>
    </div>
  );
}
