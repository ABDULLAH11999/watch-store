"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Star, X } from "lucide-react";
import { MediaImage } from "@/components/media-image";

export function TestimonialCarousel({
  items
}: {
  items: Array<{ id: string; customerName: string; customerImage: string; rating: number; reviewText: string }>;
}) {
  const [active, setActive] = useState<(typeof items)[number] | null>(null);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ y: -4 }}
            onClick={() => setActive(item)}
            className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white text-left shadow-sm transition hover:shadow-luxe"
          >
            <div className="aspect-square overflow-hidden">
              <MediaImage
                src={item.customerImage}
                alt={item.customerName}
                width={600}
                height={600}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h3 className="font-heading text-2xl text-ink">{item.customerName}</h3>
                <div className="mt-2 flex gap-1 text-gold">
                  {Array.from({ length: item.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-sm leading-6 text-black/70">{item.reviewText}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 py-8"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            >
              <button onClick={() => setActive(null)} className="absolute right-4 top-4 z-10 rounded-full bg-black/80 p-2 text-white">
                <X className="h-5 w-5" />
              </button>
              <div className="grid md:grid-cols-[1.05fr_0.95fr]">
                <div className="relative aspect-square bg-zinc-100">
                  <MediaImage src={active.customerImage} alt={active.customerName} fill className="object-cover" />
                </div>
                <div className="flex flex-col justify-center p-8">
                  <h3 className="font-heading text-4xl text-ink">{active.customerName}</h3>
                  <div className="mt-4 flex gap-1 text-gold">
                    {Array.from({ length: active.rating }).map((_, index) => (
                      <Star key={index} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-6 text-base leading-8 text-black/70">{active.reviewText}</p>
                  <p className="mt-8 text-sm uppercase tracking-[0.3em] text-brown">Testimonials from Anmol Gadgets</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
