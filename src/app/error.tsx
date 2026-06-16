"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-[0.5em] text-gold">500</p>
      <h1 className="mt-4 font-heading text-5xl">Something went wrong</h1>
      <p className="mt-4 max-w-lg text-black/65">We hit an unexpected error. You can try again or return to the home page.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
          Try Again
        </button>
        <Link href="/" className="rounded-full border border-black/10 px-6 py-3 font-semibold">
          Home
        </Link>
      </div>
    </div>
  );
}
