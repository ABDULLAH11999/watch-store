import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-[0.5em] text-gold">404</p>
      <h1 className="mt-4 font-heading text-5xl">Page not found</h1>
      <p className="mt-4 max-w-lg text-black/65">The page you’re looking for does not exist or has moved.</p>
      <Link href="/" className="mt-8 rounded-full bg-ink px-6 py-3 font-semibold text-white">
        Return Home
      </Link>
    </div>
  );
}
