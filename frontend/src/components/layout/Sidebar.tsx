import { NavLink } from "react-router-dom";
import {
  ShieldHalf,
  FileSignature,
  Radar,
  Atom,
  Link2,
  ListTree,
  BellRing,
  KeyRound,
  Lock,
  RotateCcw,
} from "lucide-react";

import { api } from "../../services/api";

const NAV = [
  { to: "/", label: "Command Center", icon: ShieldHalf, end: true },
  { to: "/signatures", label: "Signatures", icon: FileSignature },
  { to: "/threat-detection", label: "Threat Detection", icon: Radar },
  { to: "/quantum-engine", label: "Quantum Engine", icon: Atom },
  { to: "/post-quantum", label: "Post-Quantum", icon: Lock },
  { to: "/blockchain", label: "Blockchain", icon: Link2 },
  { to: "/events", label: "Events", icon: ListTree },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/keys", label: "Key Management", icon: KeyRound },
];

export default function Sidebar() {
  const handleAdminReset = async () => {
    const key = window.prompt("Enter Admin Reset Key:");

    if (!key) {
      return;
    }

    const confirmed = window.confirm(
      "WARNING: This will permanently delete all Q-SHIELD demo data.\n\n" +
        "This includes keys, signatures, events, threat analyses, alerts, " +
        "and blockchain records.\n\n" +
        "ML models will NOT be deleted.\n\n" +
        "Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.adminReset(key);

      window.alert(
        "Q-SHIELD demo data has been reset successfully."
      );

      window.location.reload();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reset demo data.";

      window.alert(`Reset failed: ${message}`);
    }
  };

  return (
    <aside className="w-60 shrink-0 border-r border-graphite-700 bg-graphite-900/80 flex flex-col">
      <div className="px-5 py-5 border-b border-graphite-700">
        <div className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path
              d="M13 1.5L23.5 6.5V13.5C23.5 19.5 19 24 13 24.5C7 24 2.5 19.5 2.5 13.5V6.5L13 1.5Z"
              stroke="#4dd8ce"
              strokeWidth="1.4"
            />
            <path
              d="M13 6L18.5 8.6V13.2C18.5 16.6 16.1 19.4 13 19.9C9.9 19.4 7.5 16.6 7.5 13.2V8.6L13 6Z"
              fill="#e8a33d"
              fillOpacity="0.18"
              stroke="#e8a33d"
              strokeWidth="1.1"
            />
            <circle cx="13" cy="13" r="1.6" fill="#4dd8ce" />
          </svg>

          <div>
            <div className="font-display font-semibold tracking-wide text-[15px] leading-none">
              Q-SHIELD
            </div>
            <div className="data-label mt-1 leading-none">
              Threat Intelligence
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded px-3 py-2 text-[13px] transition-colors ${
                isActive
                  ? "bg-graphite-800 text-offwhite border-l-2 border-cyan-400 pl-[10px]"
                  : "text-graphite-500 hover:text-offwhite hover:bg-graphite-850 border-l-2 border-transparent pl-[10px]"
              }`
            }
          >
            <Icon size={15} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Admin controls */}
      <div className="px-4 py-3 border-t border-graphite-700">
        <div className="data-label mb-2">Admin</div>

        <button
          type="button"
          onClick={handleAdminReset}
          className="w-full flex items-center gap-2 rounded px-3 py-2 text-[12px] text-graphite-500 border border-graphite-700 hover:text-offwhite hover:bg-graphite-800 hover:border-amber-500/50 transition-colors"
        >
          <RotateCcw size={14} strokeWidth={1.75} />
          Reset Demo Data
        </button>
      </div>

      <div className="px-4 py-4 border-t border-graphite-700">
        <div className="data-label mb-1">System</div>

        <div className="flex items-center gap-2 text-[12px] text-graphite-500">
          <span className="h-1.5 w-1.5 rounded-full bg-safe" />
          Local prototype — demo mode
        </div>
      </div>
    </aside>
  );
}
