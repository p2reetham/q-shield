export interface KeyItem {
  key_id: string;
  algorithm: string;
  public_key_pem: string;
  status: "ACTIVE" | "WARNING" | "COMPROMISED" | "REVOKED";
  risk_level: string;
  signature_count: number;
  created_at: string;
  last_used_at: string | null;
}

export interface SignatureItem {
  signature_id: string;
  key_id: string;
  document_hash: string;
  verification_status: string;
  created_at: string;
}

export interface EventItem {
  event_id: string;
  signature_id: string | null;
  key_id: string | null;
  event_type: string;
  threat_level: "NORMAL" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  threat_score: number;
  status: string;
  details: string;
  created_at: string;
}

export interface AlertItem {
  alert_id: string;
  severity: string;
  title: string;
  reason: string;
  recommended_action: string;
  related_event_id: string | null;
  related_key_id: string | null;
  status: string;
  created_at: string;
}

export interface BlockItem {
  block_id: string;
  index: number;
  previous_hash: string;
  current_hash: string;
  event_type: string;
  transaction_id: string;
  signature_id: string | null;
  threat_score: number;
  verification_status: string;
  created_at: string;
}

export interface DashboardSummary {
  total_signatures: number;
  valid_signatures: number;
  suspicious_signatures: number;
  blocked_requests: number;
  threats_detected: number;
  active_keys: number;
  blockchain_records: number;
  security_score: number;
  threat_distribution: Record<string, number>;
  recent_events: EventItem[];
}

export interface ThreatAnalysisResult {
  analysis_id: string;
  features: Record<string, number>;
  ml_anomaly_score: number;
  rule_score: number;
  quantum_weighted_score: number;
  final_score: number;
  classification: string;
  event_id: string;
}

export interface QuantumResult {
  features_evaluated: number;
  features_selected: number;
  selected_feature_names: string[];
  optimization_iterations: number;
  best_objective_score: number;
  optimization_time_sec: number;
  method: string;
  disclaimer: string;
}

export interface SimulateAttackResult {
  event: EventItem;
  analysis: ThreatAnalysisResult;
  quantum: QuantumResult;
  block: BlockItem;
  alert: AlertItem | null;
}
