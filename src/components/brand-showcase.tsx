"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const brands = [
  { name: "Rolex", image: "/ui-image/rolex.png", slug: "Rolex" },
  { name: "Hublot", image: "/ui-image/hublot.png", slug: "Hublot" },
  { name: "Patek Philippe", image: "/ui-image/patek.png", slug: "Patek Philippe" },
  { name: "Reward", image: "/ui-image/reward.png", slug: "Reward" }
];

export function BrandShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-8 lg:py-16">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {brands.map((brand, index) => (
          <motion.div
            key={brand.name}
            initial={{ y: 28, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
          >
            <Link
              href={`/collections?brand=${encodeURIComponent(brand.slug)}`}
              className="group block overflow-hidden rounded-[1.5rem] border border-black/10 bg-white p-4 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)]"
            >
              <div className="flex aspect-[1.25] items-center justify-center rounded-[1.2rem] bg-white">
                <div className="relative h-[72%] w-[72%]">
                  <Image
                    src={brand.image}
                    alt={`${brand.name} brand logo`}
                    fill
                    className="object-contain transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
