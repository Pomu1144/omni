from app.approval import ApprovalStore
from app.models import WorkflowButton
from app.router import JarvisCore

router = JarvisCore()
approvals = ApprovalStore()

workflow_buttons: list[WorkflowButton] = [
    WorkflowButton(id="git-status", label="Git Status", command="git status", description="Show changed files and current branch."),
    WorkflowButton(id="git-branch", label="Current Branch", command="git branch", description="Show the current branch and local branches."),
    WorkflowButton(id="git-log", label="Recent Commits", command="git log", description="Show the last 10 commits."),
    WorkflowButton(id="open-pr-demo", label="Open PR (demo)", command="git open pr", description="Simulated risky action - demonstrates the approval queue."),
]
