export default function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-xl bg-white/5 animate-pulse"
      style={{ height }}
    />
  );
}