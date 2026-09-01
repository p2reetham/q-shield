import { useEffect, useState } from "react";
import { RefreshCw, Ban, History } from "lucide-react";
import { api } from "../services/api";
import { KeyItem } from "../types";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import RiskBadge from "../components/common/RiskBadge";

export default function Keys() {
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [history, setHistory] = useState<{ keyId: string; items: any[] } | null>(null);

  const load = async () => {
    const data = (await api.listKeys()) as KeyItem[];
    setKeys(data);
  };

  useEffect(() => {
    load();
  }, []);

  const rotate = async (keyId: string) => {
    await api.rotateKey(keyId);
    load();
  };
  const revoke = async (keyId: string) => {
    await api.revokeKey(keyId);
    load();
  };
  const viewHistory = async (keyId: string) => {
    const items = await api.keyHistory(keyId);
    setHistory({ keyId, items: items as any[] });
  };

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header"><span className="data-label">Signing Keys</span></div>
        <DataTable
          rows={keys}
          keyField={(k) => k.key_id}
          columns={[
            { header: "Key ID", render: (k) => <span className="font-mono text-xs">{k.key_id}</span> },
            { header: "Algorithm", render: (k) => <span className="text-xs text-graphite-500">{k.algorithm}</span> },
            { header: "Created", render: (k) => <span className="text-xs text-graphite-500">{new Date(k.created_at).toLocaleDateString()}</span> },
            { header: "Last Used", render: (k) => <span className="text-xs text-graphite-500">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "—"}</span> },
            { header: "Signatures", render: (k) => <span className="font-mono text-xs">{k.signature_count}</span> },
            { header: "Risk", render: (k) => <RiskBadge level={k.risk_level} size="sm" /> },
            { header: "Status", render: (k) => <StatusBadge status={k.status} size="sm" /> },
            {
              header: "Actions",
              render: (k) => (
                <div className="flex gap-1.5">
                  <button title="Rotate key" onClick={() => rotate(k.key_id)} className="rounded border border-graphite-700 p-1.5 hover:bg-graphite-800">
                    <RefreshCw size={12} />
                  </button>
                  <button title="Revoke key" onClick={() => revoke(k.key_id)} className="rounded border border-graphite-700 p-1.5 hover:bg-graphite-800">
                    <Ban size={12} />
                  </button>
                  <button title="View history" onClick={() => viewHistory(k.key_id)} className="rounded border border-graphite-700 p-1.5 hover:bg-graphite-800">
                    <History size={12} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>

      {history && (
        <div className="panel p-4">
          <div className="data-label mb-3">Signature History — {history.keyId}</div>
          {history.items.length === 0 ? (
            <p className="text-sm text-graphite-500">No signatures created with this key yet.</p>
          ) : (
            <div className="space-y-1 font-mono text-xs">
              {history.items.map((s) => (
                <div key={s.signature_id} className="flex justify-between border-b border-graphite-800 py-1.5">
                  <span>{s.signature_id}</span>
                  <span className="text-graphite-500">{s.document_hash.slice(0, 16)}...</span>
                  <StatusBadge status={s.verification_status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
