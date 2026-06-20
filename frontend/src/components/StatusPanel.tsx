import type { AgentInfo, HealthStatus } from "../types";

interface StatusPanelProps {
  health: HealthStatus | null;
  agents: AgentInfo[];
  wsConnected: boolean;
}

export function StatusPanel({ health, agents, wsConnected }: StatusPanelProps) {
  return (
    <div className="status-panel">
      <div className="status-row">
        <span className={`status-dot ${wsConnected ? "ok" : "down"}`} />
        Live feed: {wsConnected ? "connected" : "reconnecting…"}
      </div>
      <div className="status-row">
        <span className={`status-dot ${health?.ollama_reachable ? "ok" : "down"}`} />
        Ollama: {health == null ? "checking…" : health.ollama_reachable ? "online" : "offline"}
      </div>

      {agents.length > 0 && (
        <>
          <p className="status-section-title">Active Agents</p>
          <ul className="agent-list">
            {agents.map((agent) => (
              <li key={agent.name}>
                <span className="agent-name">{agent.name}</span>
                <span className="agent-desc">{agent.description}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
