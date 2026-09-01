import { useState } from "react";
import { KeyRound } from "lucide-react";
import { api } from "../../services/api";
import { KeyItem } from "../../types";

export default function KeyGenerator({ onGenerated }: { onGenerated: () => void }) {
  const [label, setLabel] = useState("");
  const [lastKey, setLastKey] = useState<KeyItem | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const key = (await api.generateKey(label || undefined)) as KeyItem;
      setLastKey(key);
      setLabel("");
      onGenerated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-4 flex flex-col">
      <div className="data-label mb-2 flex items-center gap-1.5">
        <KeyRound size={13} /> Generate Key Pair
      </div>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Optional label"
        className="mb-2 bg-graphite-850 border border-graphite-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-400/50"
      />
      <button
        onClick={generate}
        disabled={loading}
        className="rounded bg-graphite-700 hover:bg-graphite-600 disabled:opacity-50 text-sm py-2 mb-3 transition-colors"
      >
        {loading ? "Generating..." : "Generate RSA-2048 Key Pair"}
      </button>

      {lastKey && (
        <div className="mt-auto space-y-1 font-mono text-[11px] text-graphite-500 border-t border-graphite-800 pt-3">
          <div><span className="text-graphite-600">Algorithm</span> {lastKey.algorithm}</div>
          <div><span className="text-graphite-600">Key ID</span> {lastKey.key_id}</div>
          <div className="truncate"><span className="text-graphite-600">Public Key</span> {lastKey.public_key_pem.slice(0, 40)}...</div>
          <div><span className="text-graphite-600">Created</span> {new Date(lastKey.created_at).toLocaleString()}</div>
          <div><span className="text-graphite-600">Status</span> <span className="text-safe">{lastKey.status}</span></div>
        </div>
      )}
    </div>
  );
}
