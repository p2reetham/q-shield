import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../services/api";
import { EventItem } from "../types";
import DataTable from "../components/common/DataTable";
import RiskBadge from "../components/common/RiskBadge";
import StatusBadge from "../components/common/StatusBadge";

const FILTERS = ["All", "Normal", "Suspicious", "High Risk", "Critical", "Blocked"];

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === "Blocked") params.status = "BLOCKED";
      else if (filter === "Normal") params.threat_level = "NORMAL";
      else if (filter === "Suspicious") params.threat_level = "MEDIUM";
      else if (filter === "High Risk") params.threat_level = "HIGH";
      else if (filter === "Critical") params.threat_level = "CRITICAL";
      if (search) params.search = search;
      const data = (await api.listEvents(params)) as EventItem[];
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded border px-3 py-1.5 text-xs transition-colors ${
                filter === f ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300" : "border-graphite-700 text-graphite-500 hover:text-offwhite"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-graphite-850 border border-graphite-700 rounded px-3 py-1.5">
          <Search size={13} className="text-graphite-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search event / signature ID..."
            className="bg-transparent text-sm focus:outline-none w-52"
          />
        </div>
      </div>

      <div className="panel">
        <DataTable
          rows={events}
          keyField={(e) => e.event_id}
          emptyLabel={loading ? "Loading..." : "No events match this filter"}
          columns={[
            { header: "Event ID", render: (e) => <span className="font-mono text-xs">{e.event_id}</span> },
            { header: "Timestamp", render: (e) => <span className="text-xs text-graphite-500">{new Date(e.created_at).toLocaleString()}</span> },
            { header: "Signature ID", render: (e) => <span className="font-mono text-xs text-graphite-500">{e.signature_id ?? "—"}</span> },
            { header: "Event Type", render: (e) => <span className="text-xs capitalize">{e.event_type.replaceAll("_", " ").toLowerCase()}</span> },
            { header: "Threat Level", render: (e) => <RiskBadge level={e.threat_level} size="sm" /> },
            { header: "Score", render: (e) => <span className="font-mono text-xs">{e.threat_score}</span> },
            { header: "Status", render: (e) => <StatusBadge status={e.status} size="sm" /> },
          ]}
        />
      </div>
    </div>
  );
}
