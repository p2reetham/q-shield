const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const error = await response.json();
      message = error.detail || error.message || message;
    } catch {
      // Keep the default error message if response isn't JSON
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  // Health
  health: () => request("/health"),

  // Dashboard
  dashboardSummary: () => request("/dashboard/summary"),

  // Keys
  listKeys: () => request("/keys"),
  generateKey: (data: any) =>
    request("/keys/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  rotateKey: (keyId: string) =>
    request(`/keys/${keyId}/rotate`, {
      method: "POST",
    }),
  revokeKey: (keyId: string) =>
    request(`/keys/${keyId}/revoke`, {
      method: "POST",
    }),
  keyHistory: (keyId: string) =>
    request(`/keys/${keyId}/history`),

  // Digital signatures
  sign: (data: any) =>
    request("/signatures/sign", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  verify: (data: any) =>
    request("/signatures/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Threat detection
  analyzeThreat: (data: any) =>
    request("/threats/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Quantum-inspired optimization
  optimizeQuantum: (data: any) =>
    request("/quantum/optimize", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Blockchain
  getBlockchain: () => request("/blockchain"),
  verifyChain: () => request("/blockchain/verify/chain"),

  // Events
  getEvents: () => request("/events"),

  // Alerts
  getAlerts: () => request("/alerts"),

  // Demo attack simulation
  simulateAttack: () =>
    request("/demo/simulate-attack", {
      method: "POST",
    }),

  // Admin
  adminReset: (key: string) =>
    request("/admin/reset", {
      method: "POST",
      headers: {
        "X-Admin-Reset-Key": key,
      },
    }),
};
