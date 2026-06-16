import Image from "next/image";
import Link from "next/link";

export function CinematicBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:px-8 lg:py-14">
      <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[240px] bg-black sm:min-h-[320px] lg:min-h-[420px]">
            <Image
              src="/ui-image/ui.webp"
              alt="Luxury watch editorial banner"
              fill
              priority={false}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />
          </div>

          <div className="flex items-center bg-white px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-black/45 sm:text-sm sm:tracking-[0.4em]">Excellence, Refined</p>
              <h2 className="mt-3 font-heading text-3xl leading-tight text-black sm:mt-4 sm:text-4xl lg:text-5xl">
                Crafted for Those Who Demand Excellence
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-black/60 sm:mt-4 sm:text-base">
                A minimal showcase for collectors who want a clean, premium browsing experience without visual noise.
              </p>
              <div className="mt-5 sm:mt-7">
                <Link
                  href="/collections"
                  className="inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/90"
                >
                  Explore All Watches
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
