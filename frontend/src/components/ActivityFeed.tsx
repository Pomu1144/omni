import type { ActivityEvent } from "../types";

interface ActivityFeedProps {
  events: ActivityEvent[];
}

function describe(event: ActivityEvent): string {
  const payload = event.payload as Record<string, unknown>;
  switch (event.type) {
    case "command_received":
      return `> ${payload.text}`;
    case "agent_result":
      return `${payload.agent}: ${payload.response}`;
    case "approval_requested":
      return `⚑ approval requested (${payload.agent}): ${payload.summary}`;
    case "approval_resolved":
      return `${payload.status === "approved" ? "✓" : "✗"} approval ${payload.status}: ${payload.summary}`;
    default:
      return JSON.stringify(payload);
  }
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return <p className="panel-empty">No activity yet. Send a command or click a workflow button.</p>;
  }

  return (
    <ul className="activity-feed">
      {events.map((event) => (
        <li key={event.id} className={`activity-item activity-${event.type}`}>
          <span className="activity-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
          <span className="activity-text">{describe(event)}</span>
        </li>
      ))}
    </ul>
  );
}
