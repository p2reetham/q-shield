import { useState } from "react";
import { Atom, Info } from "lucide-react";
import { api } from "../services/api";
import { QuantumResult } from "../types";

export default function QuantumEngine() {
  const [nFeatures, setNFeatures] = useState(18);
  const [iterations, setIterations] = useState(500);
  const [result, setResult] = useState<QuantumResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await api.optimizeQuantum({ n_features: nFeatures, iterations });
      setResult(res as QuantumResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel p-4 border-cyan-500/20">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-sm text-graphite-500">
            This module uses <span className="text-cyan-300">quantum-inspired optimization</span> techniques
            executed on classical hardware. It does not require a quantum computer. Feature
            selection is formulated as a QUBO problem and solved with simulated annealing —
            the same energy-landscape search strategy used to benchmark real quantum annealers.
          </p>
        </div>
      </div>

      <div className="panel p-4">
        <div className="data-label mb-3 flex items-center gap-1.5"><Atom size={13} /> Optimization Parameters</div>
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div>
            <label className="data-label block mb-1">Features Evaluated</label>
            <input type="number" min={4} max={18} value={nFeatures}
              onChange={(e) => setNFeatures(Number(e.target.value))}
              className="w-28 bg-graphite-850 border border-graphite-700 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="data-label block mb-1">Iterations</label>
            <input type="number" min={50} max={2000} step={50} value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-28 bg-graphite-850 border border-graphite-700 rounded px-3 py-2 text-sm" />
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-graphite-950 font-medium text-sm px-4 py-2 transition-colors"
          >
            {loading ? "Optimizing..." : "Run Quantum-Inspired Optimization"}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel p-5">
            <div className="data-label mb-3">Optimization Result</div>
            <div className="grid grid-cols-2 gap-4 font-mono text-sm">
              <div><div className="text-graphite-500 text-xs mb-1">Features Evaluated</div>{result.features_evaluated}</div>
              <div><div className="text-graphite-500 text-xs mb-1">Features Selected</div>{result.features_selected}</div>
              <div><div className="text-graphite-500 text-xs mb-1">Iterations</div>{result.optimization_iterations}</div>
              <div><div className="text-graphite-500 text-xs mb-1">Best Objective Score</div>{result.best_objective_score}</div>
              <div className="col-span-2"><div className="text-graphite-500 text-xs mb-1">Optimization Time</div>{result.optimization_time_sec}s</div>
            </div>
            <div className="mt-4 pt-3 border-t border-graphite-800 text-[11px] text-graphite-500">
              Method: {result.method}
            </div>
          </div>
          <div className="panel p-5">
            <div className="data-label mb-3">Selected Security Features</div>
            <div className="space-y-1.5">
              {result.selected_feature_names.map((f, i) => (
                <div key={f} className="flex items-center gap-2 animate-block-appear" style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span className="text-sm font-mono">{f.replaceAll("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
