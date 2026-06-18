export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface PendingApproval {
  id: string;
  agent: string;
  action: string;
  summary: string;
  detail: string;
  status: ApprovalStatus;
  created_at: string;
  resolved_at?: string | null;
}

export interface ActivityEvent {
  id: string;
  type: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface WorkflowButtonDef {
  id: string;
  label: string;
  command: string;
  description: string;
}

export interface CommandResponse {
  status: "completed" | "pending_approval";
  agent?: string;
  response?: string;
  data?: Record<string, unknown> | null;
  approval_id?: string;
  summary?: string;
}

export interface AgentInfo {
  name: string;
  description: string;
}

export interface HealthStatus {
  status: string;
  ollama_reachable: boolean;
}
