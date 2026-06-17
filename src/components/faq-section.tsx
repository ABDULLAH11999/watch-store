"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How long does delivery take in Pakistan?",
    answer: "Delivery usually takes 2 to 5 working days depending on your city and the selected courier service."
  },
  {
    question: "Do you offer returns?",
    answer: "Yes. If we send the wrong item or a defective product, we will take responsibility and resolve it professionally."
  },
  {
    question: "How can I contact support?",
    answer: "You can contact us via WhatsApp, phone, or email. Our team responds as quickly as possible during working hours."
  },
  {
    question: "Are your watches authentic?",
    answer: "We focus on premium, quality-checked products and make product details transparent so customers can buy with confidence."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs uppercase tracking-[0.35em] text-black/45 sm:text-sm">FAQ</p>
        <h2 className="mt-2 font-heading text-3xl sm:text-4xl">Frequently Asked Questions</h2>

        <div className="mt-6 space-y-3 sm:mt-8">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={faq.question} className="overflow-hidden rounded-[1.5rem] border border-black/15 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-6 sm:py-5"
                >
                  <span className="text-base font-semibold text-black sm:text-lg">{faq.question}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full border border-black/15 transition ${open ? "bg-black text-white" : "bg-white text-black"}`}>
                    <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 pt-0 text-sm leading-7 text-black/65 sm:px-6 sm:text-base">
                        {faq.answer}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
