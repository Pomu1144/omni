import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { api } from "./api/client";
import { ActivityFeed } from "./components/ActivityFeed";
import { ApprovalQueue } from "./components/ApprovalQueue";
import { CommandBar } from "./components/CommandBar";
import { GaugeReadout } from "./components/GaugeReadout";
import { HudCore } from "./components/HudCore";
import { Panel } from "./components/Panel";
import { PlaceholderPanel } from "./components/PlaceholderPanel";
import { StatusPanel } from "./components/StatusPanel";
import { VoicePanel } from "./components/VoicePanel";
import { WorkflowButtons } from "./components/WorkflowButtons";
import { useOmniSocket } from "./hooks/useOmniSocket";
import { useVoiceIO, type AssistantState } from "./hooks/useVoiceIO";
import type { ActivityEvent, AgentInfo, CommandResponse, HealthStatus, PendingApproval, WorkflowButtonDef } from "./types";

const HEALTH_POLL_MS = 10000;
const CLOCK_TICK_MS = 1000;
const MAX_ACTIVITY_ITEMS = 100;

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowButtonDef[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [now, setNow] = useState(() => new Date());

  const [voiceModeOn, setVoiceModeOn] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [ttsConfigured, setTtsConfigured] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const { supported, micState, speakState, listen, stopListening, speak, cancelSpeak } = useVoiceIO();

  const refreshApprovals = useCallback(() => {
    api.approvals().then(setApprovals).catch(() => undefined);
  }, []);

  const handleEvent = useCallback(
    (event: ActivityEvent) => {
      setActivity((previous) => [event, ...previous].slice(0, MAX_ACTIVITY_ITEMS));
      if (event.type === "approval_requested" || event.type === "approval_resolved") {
        refreshApprovals();
      }
    },
    [refreshApprovals],
  );

  const { connected } = useOmniSocket(handleEvent);

  useEffect(() => {
    api.agents().then(setAgents).catch(() => undefined);
    api.workflows().then(setWorkflows).catch(() => undefined);
    api.activity().then((events) => setActivity([...events].reverse())).catch(() => undefined);
    api.voiceStatus().then((status) => setTtsConfigured(status.configured)).catch(() => setTtsConfigured(false));
    refreshApprovals();
  }, [refreshApprovals]);

  useEffect(() => {
    function pollHealth() {
      api.health().then(setHealth).catch(() => setHealth({ status: "unreachable", ollama_reachable: false }));
    }
    pollHealth();
    const interval = setInterval(pollHealth, HEALTH_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(interval);
  }, []);

  function handleCommandResult(result: CommandResponse) {
    // The backend also broadcasts this over the WebSocket; this local update
    // just avoids a flash of "nothing happened" while that round-trips.
    if (result.status === "completed" && result.response) {
      setActivity((previous) =>
        [
          {
            id: `local-${Date.now()}`,
            type: "agent_result",
            timestamp: new Date().toISOString(),
            payload: { agent: result.agent, response: result.response },
          },
          ...previous,
        ].slice(0, MAX_ACTIVITY_ITEMS),
      );
      setLastResponse(result.response);
      if (voiceModeOn && ttsConfigured) {
        speak(result.response).catch(() => undefined);
      }
    }
  }

  function handleApprovalDecided(updated: PendingApproval) {
    setApprovals((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function runVoiceCommand(text: string) {
    setThinking(true);
    try {
      const result = await api.sendCommand(text);
      handleCommandResult(result);
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === "AbortError";
      setVoiceError(timedOut ? "Omni timed out responding to that command." : "Couldn't reach the Omni backend.");
    } finally {
      setThinking(false);
    }
  }

  async function handleMicClick() {
    if (micState === "listening") {
      stopListening();
      return;
    }
    setVoiceError(null);
    try {
      const text = await listen();
      if (text) {
        setTranscript(text);
        await runVoiceCommand(text);
      }
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : "Voice input failed.");
    }
  }

  function handleToggleVoiceMode() {
    setVoiceModeOn((on) => {
      if (on) {
        cancelSpeak();
        stopListening();
      }
      return !on;
    });
  }

  const assistantState: AssistantState =
    micState === "listening" ? "listening" : speakState === "speaking" ? "speaking" : thinking ? "thinking" : "idle";

  const coreLabel =
    assistantState === "listening" || assistantState === "thinking"
      ? transcript || "Listening for command…"
      : lastResponse ?? "Awaiting command";

  const pendingCount = approvals.filter((approval) => approval.status === "pending").length;
  const queuePct = Math.min(100, (pendingCount / 5) * 100);
  const feedPct = Math.min(100, (activity.length / MAX_ACTIVITY_ITEMS) * 100);

  const dateLabel = now.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
  const timeLabel = now.toLocaleTimeString(undefined, { hour12: false });

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>Omni Command Center</h1>
          <span className={`link-status ${connected ? "ok" : "down"}`}>{connected ? "Online" : "Offline"}</span>
        </div>
        <p>Monitor 2 dashboard — prepares, drafts, and automates; never finalizes risky actions without your approval.</p>
      </header>

      <section className="hud-hero">
        <div className="hud-topbar">
          <div className="hud-chip">
            <span className="hud-chip-label">Date</span>
            <span className="hud-chip-value">{dateLabel}</span>
          </div>
          <div className="hud-chip">
            <span className="hud-chip-label">Time</span>
            <span className="hud-chip-value">{timeLabel}</span>
          </div>
          <div className={`hud-chip ${connected ? "ok" : "down"}`}>
            <span className="hud-chip-label">Link</span>
            <span className="hud-chip-value">{connected ? "Online" : "Reconnecting"}</span>
          </div>
          <div className={`hud-chip ${health?.ollama_reachable ? "ok" : "down"}`}>
            <span className="hud-chip-label">Ollama</span>
            <span className="hud-chip-value">{health == null ? "…" : health.ollama_reachable ? "Online" : "Offline"}</span>
          </div>
          <div className="hud-chip">
            <span className="hud-chip-label">Agents</span>
            <span className="hud-chip-value">{agents.length}</span>
          </div>
        </div>

        <div className="hud-core-cluster">
          <GaugeReadout value={queuePct} valueText={String(pendingCount)} label="Queue" active={pendingCount > 0} />
          <HudCore state={assistantState} label={coreLabel} />
          <GaugeReadout value={feedPct} valueText={String(activity.length)} label="Feed" active={connected} />
        </div>

        <div className="hud-hero-controls">
          <VoicePanel
            supported={supported}
            micState={micState}
            assistantState={assistantState}
            voiceModeOn={voiceModeOn}
            ttsConfigured={ttsConfigured}
            transcript={transcript}
            lastResponse={lastResponse}
            error={voiceError}
            onToggleVoiceMode={handleToggleVoiceMode}
            onMicClick={handleMicClick}
          />
          <CommandBar onResult={handleCommandResult} />
        </div>
      </section>

      <section className="hud-dock-bar">
        <span className="hud-dock-bar-label">Workflows</span>
        <WorkflowButtons workflows={workflows} onResult={handleCommandResult} />
      </section>

      <main className="dashboard-grid">
        <div className="dashboard-column">
          <Panel title="Status">
            <StatusPanel health={health} agents={agents} wsConnected={connected} />
          </Panel>
          <Panel title="Browser automation">
            <PlaceholderPanel label="Playwright browser automation state" />
          </Panel>
        </div>

        <div className="dashboard-column">
          <Panel title="Agent activity feed">
            <ActivityFeed events={activity} />
          </Panel>
        </div>

        <div className="dashboard-column">
          <Panel title="Approval queue">
            <ApprovalQueue approvals={approvals} onDecided={handleApprovalDecided} />
          </Panel>
          <Panel title="Calendar / email / tickets">
            <PlaceholderPanel label="Calendar, email, and Jira/GitHub ticket summaries" />
          </Panel>
        </div>
      </main>
    </div>
  );
}

export default App;
