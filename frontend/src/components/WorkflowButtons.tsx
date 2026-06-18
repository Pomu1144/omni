import type { WorkflowButtonDef } from "../types";

interface WorkflowButtonsProps {
  workflows: WorkflowButtonDef[];
  sendCommand: (text: string) => Promise<void>;
}

export function WorkflowButtons({ workflows, sendCommand }: WorkflowButtonsProps) {
  if (workflows.length === 0) {
    return <p className="panel-empty">No workflows registered yet.</p>;
  }

  return (
    <div className="workflow-buttons">
      {workflows.map((workflow) => (
        <button key={workflow.id} title={workflow.description} onClick={() => sendCommand(workflow.command)}>
          {workflow.label}
        </button>
      ))}
    </div>
  );
}
