import type { ActivityEvent } from "../types";

function describe(event: ActivityEvent): string {
  const p = event.payload as Record<string, unknown>;
  switch (event.type) {
    case "command_received":
      return `// cmd  ${p.text}`;
    case "agent_result":
      return `${p.agent}  →  ${p.response}`;
    case "approval_requested":
      return `⚑  approval required  [${p.agent}]  ${p.summary}`;
    case "approval_resolved":
      return `${p.status === "approved" ? "✓" : "✗"}  ${p.status}  [${p.agent}]  ${p.summary}`;
    default:
      return JSON.stringify(p);
  }
}

function timeLabel(ts: string) {
  return new Date(ts).toLocaleTimeString(undefined, { hour12: false });
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <p className="panel-empty">// no events — issue a directive to begin</p>;
  }

  return (
    <ul className="activity-feed">
      {events.map((event) => (
        <li key={event.id} className={`activity-item activity-${event.type}`}>
          <span className="activity-time">{timeLabel(event.timestamp)}</span>
          <span className="activity-text">{describe(event)}</span>
        </li>
      ))}
    </ul>
  );
}
