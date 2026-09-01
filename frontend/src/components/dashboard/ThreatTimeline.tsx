import { EventItem } from "../../types";
import RiskBadge from "../common/RiskBadge";

export default function ThreatTimeline({ events }: { events: EventItem[] }) {
  return (
    <div className="panel p-4">
      <div className="data-label mb-3">Threat Activity Timeline</div>
      <div className="space-y-0">
        {events.length === 0 && (
          <p className="text-sm text-graphite-500 py-4 text-center">No recent security events</p>
        )}
        {events.map((e, i) => (
          <div
            key={e.event_id}
            className="flex items-center gap-3 py-2 border-b border-graphite-800 last:border-0 animate-block-appear"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="font-mono text-[12px] text-graphite-500 w-20 shrink-0">
              {new Date(e.created_at).toLocaleTimeString("en-IN", { hour12: false })}
            </span>
            <span className="text-[13px] flex-1 truncate">{e.event_type.replaceAll("_", " ").toLowerCase()}</span>
            <span className="font-mono text-[12px] text-graphite-500 w-10 text-right">{e.threat_score}</span>
            <RiskBadge level={e.threat_level} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
