import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api } from "../services/api";
import { AlertItem } from "../types";
import RiskBadge from "../components/common/RiskBadge";
import StatusBadge from "../components/common/StatusBadge";

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const load = async () => {
    const data = (await api.listAlerts()) as AlertItem[];
    setAlerts(data);
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id: string, action: "acknowledgeAlert" | "resolveAlert") => {
    await (api as any)[action](id);
    load();
  };

  return (
    <div className="space-y-4">
      {alerts.length === 0 && (
        <div className="panel p-8 text-center text-graphite-500 text-sm">
          No alerts raised yet. High or critical threat analyses generate alerts automatically.
        </div>
      )}
      {alerts.map((a) => (
        <div key={a.alert_id} className="panel p-4 border-l-2" style={{ borderLeftColor: a.severity === "CRITICAL" ? "#d1493f" : "#e8a33d" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className={a.severity === "CRITICAL" ? "text-danger" : "text-amber-400"} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <RiskBadge level={a.severity} size="sm" />
                  <span className="font-display font-medium text-sm">{a.title}</span>
                </div>
                <p className="text-sm text-graphite-500 mb-2 max-w-2xl">
                  <span className="text-graphite-600">Reason: </span>{a.reason}
                </p>
                <p className="text-sm text-cyan-300/90">
                  <span className="text-graphite-600">Recommended action: </span>{a.recommended_action}
                </p>
                <p className="text-[11px] text-graphite-600 font-mono mt-2">
                  {a.alert_id} · {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={a.status} size="sm" />
              {a.status === "OPEN" && (
                <button onClick={() => act(a.alert_id, "acknowledgeAlert")} className="text-xs rounded border border-graphite-700 px-2 py-1 hover:bg-graphite-800">
                  Acknowledge
                </button>
              )}
              {a.status !== "RESOLVED" && (
                <button onClick={() => act(a.alert_id, "resolveAlert")} className="text-xs rounded border border-graphite-700 px-2 py-1 hover:bg-graphite-800">
                  Resolve
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
