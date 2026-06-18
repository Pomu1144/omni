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
        Dashboard live feed: {wsConnected ? "connected" : "reconnecting…"}
      </div>
      <div className="status-row">
        <span className={`status-dot ${health?.ollama_reachable ? "ok" : "down"}`} />
        Local Ollama: {health ? (health.ollama_reachable ? "reachable" : "not running") : "checking…"}
      </div>
      <h3>Agents</h3>
      <ul className="agent-list">
        {agents.map((agent) => (
          <li key={agent.name}>
            <strong>{agent.name}</strong>
            <span>{agent.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
