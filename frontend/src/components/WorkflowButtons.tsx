import { useState } from "react";
import type { CommandResponse, WorkflowButtonDef } from "../types";
import { api } from "../api/client";

interface WorkflowButtonsProps {
  workflows: WorkflowButtonDef[];
  onStart?: () => void;
  onResult: (result: CommandResponse, commandText: string) => void;
}

function monogram(label: string): string {
  const letters = label
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("");
  return (letters || label.slice(0, 2)).slice(0, 2).toUpperCase();
}

export function WorkflowButtons({ workflows, onStart, onResult }: WorkflowButtonsProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function run(workflow: WorkflowButtonDef) {
    setPendingId(workflow.id);
    onStart?.();
    try {
      const result = await api.sendCommand(workflow.command);
      onResult(result, workflow.command);
    } catch {
      onResult({ status: "completed", response: "Couldn't reach the backend." }, workflow.command);
    } finally {
      setPendingId(null);
    }
  }

  if (workflows.length === 0) {
    return <p className="panel-empty">No workflows registered yet.</p>;
  }

  return (
    <div className="workflow-dock">
      {workflows.map((workflow) => (
        <button
          key={workflow.id}
          type="button"
          className={`dock-button ${pendingId === workflow.id ? "is-pending" : ""}`}
          title={workflow.description}
          onClick={() => run(workflow)}
          disabled={pendingId !== null}
        >
          <span className="dock-button-glyph">{monogram(workflow.label)}</span>
          <span className="dock-button-label">{workflow.label}</span>
        </button>
      ))}
    </div>
  );
}
