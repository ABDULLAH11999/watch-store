"use client";

import { useState } from "react";

export function NewsletterStrip() {
  const [email, setEmail] = useState("");
  return (
    <section className="bg-ink py-16 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 lg:flex-row lg:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-gold">Stay Updated</p>
          <h2 className="mt-2 font-heading text-3xl">Join our private watch list</h2>
        </div>
        <form
          className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setEmail("");
          }}
        >
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Enter your email"
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 outline-none placeholder:text-white/40"
          />
          <button className="rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-zinc-800">Subscribe</button>
        </form>
      </div>
    </section>
  );
}
