import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { api } from "../services/api";
import { BlockItem } from "../types";
import BlockchainViewer from "../components/blockchain/BlockchainViewer";
import StatusBadge from "../components/common/StatusBadge";

export default function Blockchain() {
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [selected, setSelected] = useState<BlockItem | null>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  const load = async () => {
    const data = (await api.listBlocks()) as BlockItem[];
    setBlocks(data);
    if (data.length) setSelected(data[data.length - 1]);
  };

  useEffect(() => {
    load();
  }, []);

  const verify = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyChain();
      setVerifyResult(res);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between panel p-4">
        <div>
          <div className="data-label mb-1">Blockchain Integrity</div>
          <p className="text-sm text-graphite-500">
            Local, single-process hash-chained ledger (SHA-256) — a working audit trail, not a
            decentralized network. Each block commits to the previous block's hash.
          </p>
        </div>
        <button
          onClick={verify}
          disabled={verifying}
          className="shrink-0 rounded bg-graphite-700 hover:bg-graphite-600 disabled:opacity-50 text-sm px-4 py-2 transition-colors"
        >
          {verifying ? "Verifying..." : "Verify Blockchain Integrity"}
        </button>
      </div>

      {verifyResult && (
        <div className={`panel p-4 flex items-center gap-3 ${verifyResult.verified ? "border-safe/30" : "border-danger/40"}`}>
          {verifyResult.verified ? <CheckCircle2 className="text-safe" size={20} /> : <XCircle className="text-danger" size={20} />}
          <div>
            <div className={`font-display font-medium ${verifyResult.verified ? "text-safe" : "text-danger"}`}>
              {verifyResult.verified ? "VERIFIED" : "INTEGRITY ISSUE DETECTED"}
            </div>
            <div className="text-xs text-graphite-500 font-mono">
              {verifyResult.total_blocks} blocks, {verifyResult.inconsistencies} inconsistencies
            </div>
          </div>
        </div>
      )}

      <BlockchainViewer blocks={blocks} selected={selected} onSelect={setSelected} />

      {selected && (
        <div className="panel p-5">
          <div className="data-label mb-3">Block Details</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
            <div><div className="text-graphite-500 mb-1">Block ID</div>{selected.block_id}</div>
            <div><div className="text-graphite-500 mb-1">Index</div>{selected.index}</div>
            <div><div className="text-graphite-500 mb-1">Transaction ID</div>{selected.transaction_id}</div>
            <div><div className="text-graphite-500 mb-1">Signature ID</div>{selected.signature_id ?? "—"}</div>
            <div><div className="text-graphite-500 mb-1">Threat Score</div>{selected.threat_score}</div>
            <div><div className="text-graphite-500 mb-1">Status</div><StatusBadge status={selected.verification_status} size="sm" /></div>
            <div className="col-span-2 md:col-span-3"><div className="text-graphite-500 mb-1">Previous Hash</div><span className="break-all">{selected.previous_hash}</span></div>
            <div className="col-span-2 md:col-span-3"><div className="text-graphite-500 mb-1">Current Hash</div><span className="break-all text-cyan-300">{selected.current_hash}</span></div>
            <div><div className="text-graphite-500 mb-1">Timestamp</div>{new Date(selected.created_at).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
