import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { api } from "./api/client";
import { ActivityFeed } from "./components/ActivityFeed";
import { ApprovalQueue } from "./components/ApprovalQueue";
import { CommandBar } from "./components/CommandBar";
import { Panel } from "./components/Panel";
import { PlaceholderPanel } from "./components/PlaceholderPanel";
import { StatusPanel } from "./components/StatusPanel";
import { VoiceControl } from "./components/VoiceControl";
import { WorkflowButtons } from "./components/WorkflowButtons";
import { useJarvisSocket } from "./hooks/useJarvisSocket";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import type { ActivityEvent, AgentInfo, HealthStatus, PendingApproval, WorkflowButtonDef } from "./types";

const HEALTH_POLL_MS = 10000;
const MAX_ACTIVITY_ITEMS = 100;

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowButtonDef[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [voiceRepliesEnabled, setVoiceRepliesEnabled] = useState(false);

  const { supported: ttsSupported, speaking, speak } = useSpeechSynthesis();

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

  const sendCommand = useCallback(
    async (text: string) => {
      const result = await api.sendCommand(text);
      if (result.status === "completed" && result.response && voiceRepliesEnabled) {
        speak(result.response);
      }
    },
    [voiceRepliesEnabled, speak],
  );

  function handleApprovalDecided(updated: PendingApproval) {
    setApprovals((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Jarvis Command Center</h1>
        <p>Monitor 2 dashboard — prepares, drafts, and automates; never finalizes risky actions without your approval.</p>
      </header>

      <CommandBar sendCommand={sendCommand} />

      <main className="dashboard-grid">
        <div className="dashboard-column">
          <Panel title="Voice">
            <VoiceControl
              onTranscript={sendCommand}
              speaking={speaking}
              ttsSupported={ttsSupported}
              voiceRepliesEnabled={voiceRepliesEnabled}
              onToggleVoiceReplies={() => setVoiceRepliesEnabled((value) => !value)}
            />
          </Panel>
          <Panel title="Workflows">
            <WorkflowButtons workflows={workflows} sendCommand={sendCommand} />
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
