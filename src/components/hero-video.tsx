export function HeroVideo() {
  return (
    <div className="relative h-[58svh] overflow-hidden bg-ink sm:h-[62svh] md:min-h-[86vh] md:h-auto">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
        poster="/watches/nautilus-5711.jpg"
      >
        <source src="/videos/hublot-banner.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
      <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-10 pt-16 sm:pb-12 sm:pt-20 md:min-h-[86vh] md:items-center md:px-8 md:py-24">
        <div className="max-w-3xl text-white">
          <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-gold sm:mb-3 sm:text-xs md:mb-4 md:text-sm md:tracking-[0.5em]"></p>
          <h1 className="font-heading text-[2.15rem] leading-[1.02] text-gold sm:text-4xl md:text-7xl">Anmol Gadgets</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gold/80 sm:mt-4 md:mt-6 md:text-2xl">
            Shop on a Budget.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6 md:mt-10 md:gap-4">
            <a href="/collections" className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 md:px-6 md:py-3 md:text-base">
              Shop Collection
            </a>
            <a href="/contact" className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 md:px-6 md:py-3 md:text-base">
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
