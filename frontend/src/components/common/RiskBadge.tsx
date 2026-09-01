interface Props {
  level: string;
  size?: "sm" | "md";
}

const STYLES: Record<string, string> = {
  NORMAL: "bg-safe/10 text-safe border-safe/30",
  LOW: "bg-safe/10 text-safe border-safe/30",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  HIGH: "bg-danger/10 text-danger border-danger/40",
  CRITICAL: "bg-danger/20 text-danger border-danger/60",
};

export default function RiskBadge({ level, size = "md" }: Props) {
  const cls = STYLES[level] ?? "bg-graphite-700 text-offwhite border-graphite-600";
  const padding = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded border font-mono ${padding} ${cls}`}>
      {level === "CRITICAL" && <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />}
      {level}
    </span>
  );
}
