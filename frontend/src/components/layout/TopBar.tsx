import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Security Command Center", subtitle: "Live signature threat posture" },
  "/signatures": { title: "Digital Signature Security", subtitle: "Generate keys, sign, and verify documents" },
  "/threat-detection": { title: "Threat Detection Engine", subtitle: "Rule + ML + quantum-weighted risk scoring" },
  "/quantum-engine": { title: "Quantum-Inspired Engine", subtitle: "QUBO feature selection via simulated annealing" },
  "/post-quantum": { title: "Post-Quantum Security", subtitle: "Signature-algorithm risk under quantum threat models" },
  "/blockchain": { title: "Blockchain Audit Trail", subtitle: "Hash-chained local security ledger" },
  "/events": { title: "Security Events", subtitle: "Full signing-activity event log" },
  "/alerts": { title: "Security Alerts", subtitle: "Actionable notifications from the threat engine" },
  "/keys": { title: "Key Management", subtitle: "Lifecycle and risk status of signing keys" },
};

export default function TopBar() {
  const [path, setPath] = useState(window.location.pathname);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const onNav = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onNav);
    const interval = setInterval(() => setTime(new Date()), 1000);
    const observer = new MutationObserver(() => setPath(window.location.pathname));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("popstate", onNav);
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const meta = PAGE_TITLES[path] ?? { title: "Q-SHIELD", subtitle: "" };

  return (
    <header className="h-16 shrink-0 border-b border-graphite-700 flex items-center justify-between px-6 bg-graphite-950/70 backdrop-blur">
      <div>
        <h1 className="font-display text-[17px] font-medium">{meta.title}</h1>
        <p className="text-[12px] text-graphite-500">{meta.subtitle}</p>
      </div>
      <div className="flex items-center gap-4 font-mono text-[12px] text-graphite-500">
        <span className="flex items-center gap-1.5 text-safe">
          <Radio size={13} /> LIVE
        </span>
        <span>{time.toLocaleTimeString("en-IN", { hour12: false })}</span>
      </div>
    </header>
  );
}
