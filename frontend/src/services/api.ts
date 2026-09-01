const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const error = await response.json();
      message = error.detail || error.message || message;
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  // =========================================================
  // HEALTH
  // =========================================================

  health: () =>
    request("/health"),

  // =========================================================
  // DASHBOARD
  // =========================================================

  dashboardSummary: () =>
    request("/dashboard/summary"),

  // =========================================================
  // KEYS
  // =========================================================

  listKeys: () =>
    request("/keys"),

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

  // =========================================================
  // DIGITAL SIGNATURES
  // =========================================================

  listSignatures: () =>
    request("/signatures"),

  sign: (data: any, keyId?: string) =>
    request("/sign", {
      method: "POST",
      body: JSON.stringify(
        keyId !== undefined
          ? { ...data, key_id: keyId }
          : data
      ),
    }),

  verify: (data: any) =>
    request("/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // =========================================================
  // THREAT DETECTION
  // =========================================================

  analyzeThreat: (data: any) =>
    request("/threat/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  threatScore: (score: number) =>
    request(`/threat/score/${score}`),

  // =========================================================
  // QUANTUM ENGINE
  // =========================================================

  optimizeQuantum: (data: any) =>
    request("/quantum/optimize", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // =========================================================
  // BLOCKCHAIN
  // =========================================================

  listBlocks: () =>
    request("/blockchain"),

  getBlockchain: () =>
    request("/blockchain"),

  getBlock: (blockId: string) =>
    request(`/blockchain/${blockId}`),

  verifyChain: () =>
    request("/blockchain/verify/chain"),

  // =========================================================
  // EVENTS
  // =========================================================

  listEvents: (params?: {
    threat_level?: string;
    status?: string;
    search?: string;
    limit?: number;
  }) => {
    if (!params) {
      return request("/events");
    }

    const query = new URLSearchParams();

    if (params.threat_level) {
      query.set("threat_level", params.threat_level);
    }

    if (params.status) {
      query.set("status", params.status);
    }

    if (params.search) {
      query.set("search", params.search);
    }

    if (params.limit !== undefined) {
      query.set("limit", String(params.limit));
    }

    const queryString = query.toString();

    return request(
      queryString ? `/events?${queryString}` : "/events"
    );
  },

  getEvents: () =>
    request("/events"),

  // =========================================================
  // ALERTS
  // =========================================================

  listAlerts: () =>
    request("/alerts"),

  getAlerts: () =>
    request("/alerts"),

  acknowledgeAlert: (alertId: string) =>
    request(`/alerts/${alertId}/acknowledge`, {
      method: "POST",
    }),

  resolveAlert: (alertId: string) =>
    request(`/alerts/${alertId}/resolve`, {
      method: "POST",
    }),

  // =========================================================
  // DEMO
  // =========================================================

  simulateAttack: () =>
    request("/demo/simulate-attack", {
      method: "POST",
    }),

  // =========================================================
  // ADMIN RESET
  // =========================================================

  adminReset: (key: string) =>
    request("/admin/reset", {
      method: "POST",
      headers: {
        "X-Admin-Reset-Key": key,
      },
    }),
};
