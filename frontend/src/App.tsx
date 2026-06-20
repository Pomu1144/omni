import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { api } from "./api/client";
import { ActivityFeed } from "./components/ActivityFeed";
import { ApprovalQueue } from "./components/ApprovalQueue";
import { CommandBar } from "./components/CommandBar";
import { HudCore } from "./components/HudCore";
import { Panel } from "./components/Panel";
import { PlaceholderPanel } from "./components/PlaceholderPanel";
import { StatusPanel } from "./components/StatusPanel";
import { VoicePanel } from "./components/VoicePanel";
import { WorkflowButtons } from "./components/WorkflowButtons";
import { useJarvisSocket } from "./hooks/useJarvisSocket";
import { useVoiceIO, type AssistantState } from "./hooks/useVoiceIO";
import type {
  ActivityEvent,
  AgentInfo,
  CommandResponse,
  HealthStatus,
  PendingApproval,
  VoiceStatus,
  WorkflowButtonDef,
} from "./types";

const HEALTH_POLL_MS = 10000;
const MAX_ACTIVITY_ITEMS = 100;

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowButtonDef[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);

  const [voiceModeOn, setVoiceModeOn] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus | null>(null);
  const [transcript, setTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const voice = useVoiceIO();

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

  const { connected } = useJarvisSocket(handleEvent);

  useEffect(() => {
    api.agents().then(setAgents).catch(() => undefined);
    api.workflows().then(setWorkflows).catch(() => undefined);
    api.activity().then((events) => setActivity([...events].reverse())).catch(() => undefined);
    api
      .voiceStatus()
      .then(setVoiceStatus)
      .catch(() => setVoiceStatus({ configured: false, voice_id: "" }));
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

  const handleCommandResult = useCallback(
    (result: CommandResponse) => {
      setThinking(false);
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
        if (voiceModeOn) {
          voice.speak(result.response).catch((err) => {
            setVoiceError(err instanceof Error ? err.message : "Couldn't play voice response.");
          });
        }
      }
    },
    [voice, voiceModeOn],
  );

  function handleApprovalDecided(updated: PendingApproval) {
    setApprovals((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function handleMicClick() {
    if (voice.micState === "listening") {
      voice.stopListening();
      return;
    }
    setVoiceError(null);
    setTranscript("");
    try {
      const text = await voice.listen();
      if (!text) return;
      setTranscript(text);
      setThinking(true);
      const result = await api.sendCommand(text);
      handleCommandResult(result);
    } catch (err) {
      setThinking(false);
      setVoiceError(err instanceof Error ? err.message : "Voice input failed.");
    }
  }

  const assistantState: AssistantState = thinking
    ? "thinking"
    : voice.micState === "listening"
      ? "listening"
      : voice.speakState === "speaking"
        ? "speaking"
        : "idle";

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>Jarvis Command Center</h1>
          <span className={`link-status ${connected ? "ok" : "down"}`}>{connected ? "LINK ONLINE" : "LINK LOST"}</span>
        </div>
        <p>Monitor 2 dashboard — prepares, drafts, and automates; never finalizes risky actions without your approval.</p>
      </header>

      <section className="hud-hero">
        <HudCore state={assistantState} label={voiceModeOn ? "VOICE MODE ENGAGED" : "VOICE MODE OFF"} />
        <div className="hud-hero-controls">
          <VoicePanel
            supported={voice.supported}
            micState={voice.micState}
            assistantState={assistantState}
            voiceModeOn={voiceModeOn}
            ttsConfigured={voiceStatus ? voiceStatus.configured : null}
            transcript={transcript}
            lastResponse={lastResponse}
            error={voiceError}
            onToggleVoiceMode={() => setVoiceModeOn((value) => !value)}
            onMicClick={handleMicClick}
          />
          <CommandBar onStart={() => setThinking(true)} onResult={handleCommandResult} />
        </div>
      </section>

      <main className="dashboard-grid">
        <div className="dashboard-column">
          <Panel title="Workflows">
            <WorkflowButtons onStart={() => setThinking(true)} workflows={workflows} onResult={handleCommandResult} />
          </Panel>
          <Panel title="Status">
            <StatusPanel health={health} agents={agents} wsConnected={connected} />
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
          <Panel title="Browser automation">
            <PlaceholderPanel label="Playwright browser automation state" />
          </Panel>
        </div>
      </main>
    </div>
  );
}

export default App;
