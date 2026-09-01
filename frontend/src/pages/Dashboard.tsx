import { useEffect, useState } from "react";
import { Zap, FileCheck2, ShieldAlert, Ban, Radar, KeyRound, Link2 } from "lucide-react";
import { api } from "../services/api";
import { DashboardSummary, SimulateAttackResult } from "../types";
import SecurityScore from "../components/dashboard/SecurityScore";
import ThreatOverview from "../components/dashboard/ThreatOverview";
import ThreatTimeline from "../components/dashboard/ThreatTimeline";
import RecentIncidents from "../components/dashboard/RecentIncidents";
import LoadingState from "../components/common/LoadingState";
import RiskBadge from "../components/common/RiskBadge";

function StatTile({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number | string; accent?: string }) {
  return (
    <div className="panel p-4 animate-count-up">
      <div className="flex items-center justify-between mb-2">
        <span className="data-label">{label}</span>
        <Icon size={15} className={accent ?? "text-graphite-500"} strokeWidth={1.75} />
      </div>
      <div className="font-display text-2xl font-semibold mono-value">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [simResult, setSimResult] = useState<SimulateAttackResult | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const load = async () => {
    try {
      const data = await api.dashboardSummary();
      setSummary(data as DashboardSummary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runSimulation = async () => {
    setSimulating(true);
    setSimResult(null);
    setSimStep(1);
    try {
      await new Promise((r) => setTimeout(r, 350));
      setSimStep(2);
      await new Promise((r) => setTimeout(r, 350));
      setSimStep(3);
      const result = (await api.simulateAttack()) as SimulateAttackResult;
      setSimStep(4);
      await new Promise((r) => setTimeout(r, 250));
      setSimStep(5);
      setSimResult(result);
      await load();
    } finally {
      setSimulating(false);
    }
  };

  if (loading || !summary) return <LoadingState label="Loading command center" />;

  const steps = [
    "Event generated",
    "Feature extraction",
    "ML anomaly detection",
    "Quantum-inspired optimization",
    "Threat score + blockchain record + alert",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatTile icon={FileCheck2} label="Total Signatures" value={summary.total_signatures} />
        <StatTile icon={FileCheck2} label="Valid Signatures" value={summary.valid_signatures} accent="text-safe" />
        <StatTile icon={ShieldAlert} label="Suspicious" value={summary.suspicious_signatures} accent="text-amber-400" />
        <StatTile icon={Ban} label="Blocked Requests" value={summary.blocked_requests} accent="text-danger" />
        <StatTile icon={Radar} label="Threats Detected" value={summary.threats_detected} accent="text-amber-400" />
        <StatTile icon={KeyRound} label="Active Keys" value={summary.active_keys} accent="text-cyan-400" />
        <StatTile icon={Link2} label="Blockchain Records" value={summary.blockchain_records} accent="text-cyan-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SecurityScore score={summary.security_score} />
        <ThreatOverview distribution={summary.threat_distribution} />
        <div className="panel p-4 flex flex-col">
          <div className="data-label mb-2">End-to-End Demo</div>
          <p className="text-sm text-graphite-500 mb-3 flex-1">
            Simulate a signing event and watch it move through feature extraction, ML
            anomaly detection, quantum-inspired optimization, threat scoring, blockchain
            recording, and alerting.
          </p>
          <button
            onClick={runSimulation}
            disabled={simulating}
            className="flex items-center justify-center gap-2 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-graphite-950 font-medium text-sm py-2.5 transition-colors"
          >
            <Zap size={15} />
            {simulating ? "Simulating..." : "Simulate Attack"}
          </button>
          {simulating && (
            <div className="mt-3 space-y-1.5 font-mono text-[11px] text-graphite-500">
              {steps.map((s, i) => (
                <div key={s} className={`flex items-center gap-2 transition-opacity ${i < simStep ? "opacity-100 text-cyan-400" : "opacity-40"}`}>
                  <span>{i < simStep ? "✓" : "○"}</span> {s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {simResult && (
        <div className="panel p-4 animate-count-up">
          <div className="flex items-center justify-between mb-3">
            <span className="data-label">Simulation Result</span>
            <RiskBadge level={simResult.event.threat_level} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="data-label mb-1">Final Score</div>
              <div className="font-mono text-lg">{simResult.analysis.final_score} / 100</div>
            </div>
            <div>
              <div className="data-label mb-1">Quantum Features Selected</div>
              <div className="font-mono text-lg">{simResult.quantum.features_selected} / {simResult.quantum.features_evaluated}</div>
            </div>
            <div>
              <div className="data-label mb-1">Blockchain Block</div>
              <div className="font-mono text-xs truncate">{simResult.block.block_id}</div>
            </div>
            <div>
              <div className="data-label mb-1">Alert</div>
              <div className="font-mono text-xs">{simResult.alert ? simResult.alert.severity : "None raised"}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ThreatTimeline events={summary.recent_events} />
        <RecentIncidents events={summary.recent_events} />
      </div>
    </div>
  );
}
