export default function StatCard({ icon, label, value, sub, accent = "#826dd2" }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="flex-1 min-w-[10rem] p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] flex flex-col gap-2 box-border">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-white leading-none m-0">{value}</p>
        <p className="text-[0.7rem] text-white/40 m-0 mt-1">{label}</p>
        {sub && <p className="text-[0.65rem] m-0 mt-0.5" style={{ color: accent }}>{sub}</p>}
      </div>
    </div>
  );
}
