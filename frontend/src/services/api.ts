const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json();
}

export const api = {
  health: () => request("/health"),

  // Keys
  listKeys: () => request("/keys"),
  generateKey: (label?: string) =>
    request("/keys/generate", { method: "POST", body: JSON.stringify({ label }) }),
  rotateKey: (keyId: string) => request(`/keys/${keyId}/rotate`, { method: "POST" }),
  revokeKey: (keyId: string) => request(`/keys/${keyId}/revoke`, { method: "POST" }),
  keyHistory: (keyId: string) => request(`/keys/${keyId}/history`),

  // Signatures
  sign: (keyId: string, content: string) =>
    request("/sign", { method: "POST", body: JSON.stringify({ key_id: keyId, content }) }),
  verify: (payload: Record<string, unknown>) =>
    request("/verify", { method: "POST", body: JSON.stringify(payload) }),
  listSignatures: () => request("/signatures"),

  // Threats
  analyzeThreat: (payload: Record<string, unknown>) =>
    request("/threat/analyze", { method: "POST", body: JSON.stringify(payload) }),

  // Quantum
  optimizeQuantum: (payload: Record<string, unknown>) =>
    request("/quantum/optimize", { method: "POST", body: JSON.stringify(payload) }),

  // Blockchain
  listBlocks: () => request("/blockchain"),
  getBlock: (blockId: string) => request(`/blockchain/${blockId}`),
  verifyChain: () => request("/blockchain/verify/chain"),

  // Events
  listEvents: (params?: { threat_level?: string; status?: string; search?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/events${qs ? `?${qs}` : ""}`);
  },

  // Alerts
  listAlerts: () => request("/alerts"),
  acknowledgeAlert: (id: string) => request(`/alerts/${id}/acknowledge`, { method: "POST" }),
  resolveAlert: (id: string) => request(`/alerts/${id}/resolve`, { method: "POST" }),

  // Dashboard / demo
  dashboardSummary: () => request("/dashboard/summary"),
  simulateAttack: () => request("/demo/simulate-attack", { method: "POST" }),
};
