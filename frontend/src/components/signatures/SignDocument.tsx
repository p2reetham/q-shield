import { useState } from "react";
import { PenTool } from "lucide-react";
import { api } from "../../services/api";
import { KeyItem } from "../../types";

interface Props {
  keys: KeyItem[];
  onSigned: () => void;
}

export default function SignDocument({ keys, onSigned }: Props) {
  const [keyId, setKeyId] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeKeys = keys.filter((k) => k.status === "ACTIVE");

  const sign = async () => {
    setError("");
    setResult(null);

    if (!keyId || !content.trim()) {
      setError("Select a key and enter content");
      return;
    }

    setLoading(true);

    try {
      const res = await api.sign({
        key_id: keyId,
        content: content,
      });

      setResult(res);
      onSigned();
    } catch (e: any) {
      setError(
        e?.message ||
          e?.detail ||
          "Failed to create digital signature"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-4 flex flex-col">
      <div className="data-label mb-2 flex items-center gap-1.5">
        <PenTool size={13} />
        Sign Document
      </div>

      <select
        value={keyId}
        onChange={(e) => setKeyId(e.target.value)}
        className="mb-2 bg-graphite-850 border border-graphite-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-400/50"
      >
        <option value="">Select active key...</option>

        {activeKeys.map((k) => (
          <option key={k.key_id} value={k.key_id}>
            {k.key_id}
          </option>
        ))}
      </select>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter document text to sign..."
        rows={3}
        className="mb-2 bg-graphite-850 border border-graphite-700 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-cyan-400/50"
      />

      <button
        onClick={sign}
        disabled={loading}
        className="rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-graphite-950 font-medium text-sm py-2 mb-3 transition-colors"
      >
        {loading ? "Signing..." : "Create Digital Signature"}
      </button>

      {error && (
        <p className="text-danger text-xs mb-2">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-auto space-y-1 font-mono text-[11px] text-graphite-500 border-t border-graphite-800 pt-3">
          <div className="truncate">
            <span className="text-graphite-600">
              Signature ID
            </span>{" "}
            {result.signature_id}
          </div>

          <div className="truncate">
            <span className="text-graphite-600">
              Document Hash
            </span>{" "}
            {result.document_hash}
          </div>

          <div className="truncate">
            <span className="text-graphite-600">
              Signature
            </span>{" "}
            {result.signature_hex
              ? `${result.signature_hex.slice(0, 32)}...`
              : "—"}
          </div>

          <div>
            <span className="text-graphite-600">
              Key ID
            </span>{" "}
            {result.key_id}
          </div>

          <div>
            <span className="text-graphite-600">
              Timestamp
            </span>{" "}
            {result.timestamp
              ? new Date(result.timestamp).toLocaleString()
              : "—"}
          </div>

          <div>
            <span className="text-graphite-600">
              Status
            </span>{" "}
            <span className="text-safe">
              {result.verification_status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
