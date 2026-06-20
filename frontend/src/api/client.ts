import type {
  AgentInfo,
  CommandResponse,
  HealthStatus,
  PendingApproval,
  ActivityEvent,
  VoiceStatus,
  WorkflowButtonDef,
} from "../types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
export const WS_URL = `${API_BASE_URL.replace(/^http/, "ws")}/ws/events`;

// Backend agents cap their own work (Ollama: ~5s, git subprocesses: 10s) and
// always return a result either way, but a hung connection (backend down,
// dropped socket) would otherwise leave a fetch — and any UI state waiting
// on it, like the HUD's "thinking" indicator — pending forever.
const REQUEST_TIMEOUT_MS = 20000;

async function fetchWithTimeout(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${API_BASE_URL}${path}`, { signal: controller.signal, ...init });
  } finally {
    clearTimeout(timeout);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchWithTimeout(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthStatus>("/api/health"),
  agents: () => request<AgentInfo[]>("/api/agents"),
  workflows: () => request<WorkflowButtonDef[]>("/api/workflows"),
  activity: (count = 50) => request<ActivityEvent[]>(`/api/activity?count=${count}`),
  approvals: () => request<PendingApproval[]>("/api/approvals"),
  sendCommand: (text: string) =>
    request<CommandResponse>("/api/command", { method: "POST", body: JSON.stringify({ text }) }),
  decideApproval: (id: string, approve: boolean) =>
    request<PendingApproval>(`/api/approvals/${id}/decision`, {
      method: "POST",
      body: JSON.stringify({ approve }),
    }),
  voiceStatus: () => request<VoiceStatus>("/api/voice/status"),
  speak: async (text: string): Promise<Blob> => {
    const response = await fetchWithTimeout("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error(`POST /api/voice/speak failed: ${response.status}`);
    }
    return response.blob();
  },
};
