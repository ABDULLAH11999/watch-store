"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { demoProducts } from "@/lib/demo-data";

const videos = [
  {
    name: "Reward Signature",
    src: "/videos/watch-card-0.mp4",
    poster: demoProducts[1].images[0],
    brand: "Reward"
  },
  {
    name: "Patek Philippe Elegance",
    src: "/videos/watch-card-1.mp4",
    poster: demoProducts[4].images[0],
    brand: "Patek Philippe"
  },
  {
    name: "Rolex Oyster Perpetual",
    src: "/videos/watch-card-2.mp4",
    poster: demoProducts[5].images[0],
    brand: "Rolex"
  }
];

export function VideoCardRow() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-8 lg:py-16">
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.name}
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12 }}
          >
            <Link
              href={`/collections?brand=${encodeURIComponent(video.brand)}`}
              className="group relative block overflow-hidden rounded-3xl border border-black/10 bg-black shadow-luxe"
            >
              <video src={video.src} poster={video.poster} autoPlay muted loop playsInline preload="metadata" className="h-[320px] w-full object-cover opacity-85 sm:h-[360px] md:h-[420px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-5">
                <h3 className="mt-1 font-heading text-xl sm:mt-2 sm:text-2xl">{video.name}</h3>
              </div>
              <div className="absolute inset-0 rounded-3xl border border-transparent transition group-hover:border-gold" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
