export function BrandStrip() {
  const items = ["Hublot", "Patek Philippe", "Swiss Made", "Rolex","Reward"];
  const repeated = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-black/10 bg-[#f6efe0] py-4">
      <div className="marquee gap-10 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.4em] text-brown">
        {repeated.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
