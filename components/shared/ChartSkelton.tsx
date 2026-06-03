export default function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/95"
      style={{ height }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)]" />

      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2 sm:inset-x-6">
        {[48, 72, 42, 96, 66, 118, 84].map((barHeight, index) => (
          <div
            key={index}
            className="relative flex-1 overflow-hidden rounded-t-xl bg-white/[0.06]"
            style={{ height: `${barHeight}%`, maxHeight: height - 56 }}
          >
            <div className="absolute inset-0 animate-pulse bg-white/[0.04]" />
          </div>
        ))}
      </div>

      <div className="absolute left-4 top-4 h-3 w-28 animate-pulse rounded-full bg-white/10 sm:left-6" />
      <div className="absolute left-4 top-10 h-2 w-44 animate-pulse rounded-full bg-white/[0.06] sm:left-6" />

      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}
