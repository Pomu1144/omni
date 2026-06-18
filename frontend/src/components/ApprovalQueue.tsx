import type { PendingApproval } from "../types";
import { api } from "../api/client";

interface ApprovalQueueProps {
  approvals: PendingApproval[];
  onDecided: (approval: PendingApproval) => void;
}

export function ApprovalQueue({ approvals, onDecided }: ApprovalQueueProps) {
  async function decide(id: string, approve: boolean) {
    const updated = await api.decideApproval(id, approve);
    onDecided(updated);
  }

  if (approvals.length === 0) {
    return <p className="panel-empty">Nothing waiting on your approval.</p>;
  }

  return (
    <ul className="approval-queue">
      {approvals.map((approval) => (
        <li key={approval.id} className={`approval-item approval-${approval.status}`}>
          <div className="approval-summary">
            <span className="approval-agent">{approval.agent}</span>
            {approval.summary}
          </div>
          {approval.status === "pending" ? (
            <div className="approval-actions">
              <button className="approve" onClick={() => decide(approval.id, true)}>
                Approve
              </button>
              <button className="reject" onClick={() => decide(approval.id, false)}>
                Reject
              </button>
            </div>
          ) : (
            <span className="approval-status-label">{approval.status}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
