export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm md:p-5">
      <p className="text-[11px] uppercase tracking-[0.3em] text-black/50 md:text-sm">{label}</p>
      <div className="mt-3 font-heading text-2xl leading-none md:text-4xl">{value}</div>
    </div>
  );
}
