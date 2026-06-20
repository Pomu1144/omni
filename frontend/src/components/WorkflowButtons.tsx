import type { CommandResponse, WorkflowButtonDef } from "../types";
import { api } from "../api/client";

interface WorkflowButtonsProps {
  workflows: WorkflowButtonDef[];
  onStart?: () => void;
  onResult: (result: CommandResponse, commandText: string) => void;
}

export function WorkflowButtons({ workflows, onStart, onResult }: WorkflowButtonsProps) {
  async function run(workflow: WorkflowButtonDef) {
    onStart?.();
    try {
      const result = await api.sendCommand(workflow.command);
      onResult(result, workflow.command);
    } catch {
      onResult({ status: "completed", response: "Couldn't reach the backend." }, workflow.command);
    }
  }

  if (workflows.length === 0) {
    return <p className="panel-empty">No workflows registered yet.</p>;
  }

  return (
    <div className="workflow-buttons">
      {workflows.map((workflow) => (
        <button key={workflow.id} title={workflow.description} onClick={() => run(workflow)}>
          {workflow.label}
        </button>
      ))}
    </div>
  );
}
