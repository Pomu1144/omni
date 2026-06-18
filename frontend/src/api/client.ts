import type {
  AgentInfo,
  CommandResponse,
  HealthStatus,
  PendingApproval,
  ActivityEvent,
  WorkflowButtonDef,
} from "../types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
export const WS_URL = `${API_BASE_URL.replace(/^http/, "ws")}/ws/events`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
};
