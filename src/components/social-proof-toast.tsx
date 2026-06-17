"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { demoSocialProof } from "@/lib/demo-data";
import { MediaImage } from "@/components/media-image";

type ToastItem = {
  id: number;
  name: string;
  city: string;
  product: string;
  image: string;
  timeAgo: string;
};

export function SocialProofToast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const spawn = () => {
      if (!demoSocialProof.length) return;
      const sample = demoSocialProof[Math.floor(Math.random() * demoSocialProof.length)];
      setItems((current) => [
        {
          id: Date.now(),
          name: sample.name,
          city: sample.city,
          product: sample.product,
          image: sample.image,
          timeAgo: "2 min ago"
        },
        ...current
      ]);
    };
    spawn();
    const timer = setInterval(spawn, 30000);
    return () => clearInterval(timer);
  }, []);

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
            <MediaImage src={item.image} alt={item.product} width={40} height={40} className="h-10 w-10 rounded-xl object-cover" />
            <div className="text-sm">
              <p className="font-medium text-ink">
                {item.name} from {item.city} purchased {item.product}
              </p>
              <p className="text-xs text-black/50">{item.timeAgo}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
