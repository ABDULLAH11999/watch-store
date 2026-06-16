export function CinematicBanner() {
  return (
    <section className="relative overflow-hidden bg-ink py-8 sm:py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-gold/40">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-[280px] w-full object-cover opacity-70 sm:h-[360px] lg:h-[420px]"
            poster="/watches/grand-complications-5270.jpg"
          >
            <source src="/videos/watch-card-2.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 flex items-center px-4 text-white sm:px-6 lg:px-12">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-gold sm:text-sm sm:tracking-[0.4em]">Excellence, Refined</p>
              <h2 className="mt-2 font-heading text-3xl md:mt-3 md:text-6xl">Crafted for Those Who Demand Excellence</h2>
              <a href="/collections" className="mt-5 inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:mt-8 sm:px-6 sm:py-3 sm:text-base">
                Explore All Watches
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
