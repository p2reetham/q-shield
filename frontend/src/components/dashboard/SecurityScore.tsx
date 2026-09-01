import { useEffect, useState } from "react";

export default function SecurityScore({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 800;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(score * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - display / 100);
  const color = score >= 80 ? "#4c9a6a" : score >= 55 ? "#e8a33d" : "#d1493f";

  return (
    <div className="panel p-5 flex items-center gap-5">
      <div className="relative shrink-0">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="54" fill="none" stroke="#2a2f36" strokeWidth="8" />
          <circle
            cx="64" cy="64" r="54" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 64 64)" style={{ transition: "stroke-dashoffset 0.2s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-semibold">{display}</span>
          <span className="data-label">/ 100</span>
        </div>
      </div>
      <div>
        <div className="data-label mb-1">System Security Score</div>
        <p className="text-sm text-graphite-500 max-w-[220px]">
          Composite of recent threat scores across all signing activity, blockchain
          integrity, and open alerts.
        </p>
      </div>
    </div>
  );
}
