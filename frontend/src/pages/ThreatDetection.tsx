import { useState } from "react";
import { Play } from "lucide-react";
import { api } from "../services/api";
import { ThreatAnalysisResult } from "../types";
import RiskBadge from "../components/common/RiskBadge";

const SCENARIOS = [
  { id: "normal", label: "Normal Signature" },
  { id: "suspicious", label: "Suspicious Signature" },
  { id: "replay_attack", label: "Replay Attack" },
  { id: "key_compromise", label: "Key Compromise" },
  { id: "anomalous_signing", label: "Anomalous Signing" },
  { id: "invalid_signature", label: "Invalid Signature" },
];

function ScoreGauge({ score }: { score: number }) {
  const color = score <= 20 ? "#4c9a6a" : score <= 40 ? "#4dd8ce" : score <= 60 ? "#e8a33d" : score <= 80 ? "#d1786a" : "#d1493f";
  return (
    <div className="relative w-full h-4 bg-graphite-800 rounded-full overflow-hidden border border-graphite-700">
      <div
        className="h-full transition-all duration-700 ease-out rounded-full"
        style={{ width: `${score}%`, background: color }}
      />
    </div>
  );
}

export default function ThreatDetection() {
  const [scenario, setScenario] = useState("suspicious");
  const [result, setResult] = useState<ThreatAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await api.analyzeThreat({ scenario });
      setResult(res as ThreatAnalysisResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel p-4">
        <div className="data-label mb-3">Simulate Signing Activity</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenario(s.id)}
              className={`rounded border px-3 py-1.5 text-xs font-mono transition-colors ${
                scenario === s.id
                  ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300"
                  : "border-graphite-700 text-graphite-500 hover:text-offwhite"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-2 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-graphite-950 font-medium text-sm px-4 py-2 transition-colors"
        >
          <Play size={14} /> {loading ? "Analyzing..." : "Run Threat Analysis"}
        </button>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="panel p-5 lg:col-span-1 flex flex-col items-center justify-center text-center">
              <div className="data-label mb-2">Composite Threat Score</div>
              <div className="font-display text-5xl font-semibold mono-value mb-2">{result.final_score}</div>
              <RiskBadge level={result.classification} />
            </div>
            <div className="panel p-5 lg:col-span-2 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-graphite-500">Rule-Based Score</span><span className="font-mono">{result.rule_score}</span></div>
                <ScoreGauge score={result.rule_score} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-graphite-500">ML Anomaly Score (Isolation Forest)</span><span className="font-mono">{result.ml_anomaly_score}</span></div>
                <ScoreGauge score={result.ml_anomaly_score} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-graphite-500">Quantum-Weighted Score</span><span className="font-mono">{result.quantum_weighted_score}</span></div>
                <ScoreGauge score={result.quantum_weighted_score} />
              </div>
            </div>
          </div>

          <div className="panel p-4">
            <div className="data-label mb-3">Feature Vector Used</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 font-mono text-[11px]">
              {Object.entries(result.features).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-graphite-800 py-1">
                  <span className="text-graphite-500 truncate mr-2">{k.replaceAll("_", " ")}</span>
                  <span>{(v as number).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="panel p-4">
        <div className="data-label mb-2">Threat Score Bands</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {[
            ["0–20", "NORMAL", "safe"],
            ["21–40", "LOW", "cyan"],
            ["41–60", "MEDIUM", "amber"],
            ["61–80", "HIGH", "danger"],
            ["81–100", "CRITICAL", "danger"],
          ].map(([range, label]) => (
            <div key={label} className="border border-graphite-700 rounded p-2 text-center">
              <div className="font-mono text-graphite-500">{range}</div>
              <RiskBadge level={label} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
