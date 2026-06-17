"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const benefits = [
  "Authentic luxury watch sourcing",
  "Premium packaging and careful handling",
  "Cash on delivery across Pakistan",
  "Fast customer response on WhatsApp",
  "Trusted after-sales support"
];

export function WhyChooseSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-8 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
        <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.05)] sm:p-6 lg:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-black/45 sm:text-sm">Why Choose</p>
          <h2 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">Why people choose Anmol Gadgets</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-black/60 sm:text-base">
            We keep the buying experience simple, trustworthy, and premium. Every order is handled with the same care we would expect for a luxury watch.
          </p>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.05)] sm:p-6">
          <div className="overflow-hidden rounded-[1.5rem] border border-black/10">
            {benefits.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className={`grid grid-cols-[1fr_auto] items-center gap-3 border-b border-black/10 px-4 py-4 sm:px-5 ${index === benefits.length - 1 ? "border-b-0" : ""}`}
              >
                <span className="text-sm font-medium text-black sm:text-base">{item}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                  <Check className="h-4 w-4" />
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
