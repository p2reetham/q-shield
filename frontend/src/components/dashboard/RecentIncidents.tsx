import { EventItem } from "../../types";
import DataTable from "../common/DataTable";
import RiskBadge from "../common/RiskBadge";
import StatusBadge from "../common/StatusBadge";

export default function RecentIncidents({ events }: { events: EventItem[] }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="data-label">Recent Incidents</span>
      </div>
      <DataTable
        rows={events}
        keyField={(e) => e.event_id}
        columns={[
          { header: "Event", render: (e) => <span className="font-mono text-xs">{e.event_id}</span> },
          { header: "Type", render: (e) => <span className="capitalize">{e.event_type.replaceAll("_", " ").toLowerCase()}</span> },
          { header: "Level", render: (e) => <RiskBadge level={e.threat_level} size="sm" /> },
          { header: "Score", render: (e) => <span className="font-mono">{e.threat_score}</span> },
          { header: "Status", render: (e) => <StatusBadge status={e.status} size="sm" /> },
        ]}
      />
    </div>
  );
}
