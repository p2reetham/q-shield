import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api } from "../../services/api";

export default function VerifySignature() {
  const [signatureId, setSignatureId] = useState("");
  const [result, setResult] = useState<{ valid: boolean; verification_status: string; reason: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (!signatureId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.verify({ signature_id: signatureId });
      setResult(res as any);
    } catch (e: any) {
      setResult({ valid: false, verification_status: "INVALID", reason: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-4 flex flex-col">
      <div className="data-label mb-2 flex items-center gap-1.5">
        <ShieldCheck size={13} /> Verify Signature
      </div>
      <input
        value={signatureId}
        onChange={(e) => setSignatureId(e.target.value)}
        placeholder="Enter Signature ID (e.g. SIG-XXXXXXXXXX)"
        className="mb-2 bg-graphite-850 border border-graphite-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-400/50"
      />
      <button
        onClick={verify}
        disabled={loading}
        className="rounded bg-graphite-700 hover:bg-graphite-600 disabled:opacity-50 text-sm py-2 mb-3 transition-colors"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {result && (
        <div className="mt-auto text-center py-4 rounded border" style={{
          borderColor: result.valid ? "#4c9a6a55" : "#d1493f55",
          background: result.valid ? "#4c9a6a12" : "#d1493f12",
        }}>
          <div className={`font-display text-lg font-semibold ${result.valid ? "text-safe" : "text-danger"}`}>
            {result.valid ? "VALID" : "INVALID / SUSPICIOUS"}
          </div>
          <p className="text-[11px] text-graphite-500 mt-1 px-3">{result.reason}</p>
        </div>
      )}
    </div>
  );
}
