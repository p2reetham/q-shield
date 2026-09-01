interface Props {
  status: string;
  size?: "sm" | "md";
}

const STYLES: Record<string, string> = {
  ACTIVE: "bg-safe/10 text-safe border-safe/30",
  VALID: "bg-safe/10 text-safe border-safe/30",
  LOGGED: "bg-graphite-700 text-graphite-500 border-graphite-600",
  WARNING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  BLOCKED: "bg-danger/15 text-danger border-danger/40",
  INVALID: "bg-danger/15 text-danger border-danger/40",
  SUSPICIOUS: "bg-danger/15 text-danger border-danger/40",
  COMPROMISED: "bg-danger/20 text-danger border-danger/60",
  REVOKED: "bg-graphite-700 text-graphite-500 border-graphite-600",
  RESOLVED: "bg-safe/10 text-safe border-safe/30",
  OPEN: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  ACKNOWLEDGED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
};

export default function StatusBadge({ status, size = "md" }: Props) {
  const cls = STYLES[status] ?? "bg-graphite-700 text-offwhite border-graphite-600";
  const padding = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";
  return (
    <span className={`inline-flex items-center rounded border font-mono ${padding} ${cls}`}>
      {status}
    </span>
  );
}
