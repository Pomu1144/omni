import subprocess

from app.agents.base import Agent
from app.config import settings
from app.models import AgentResult

_RISKY_KEYWORDS = ("open pr", "create pr", "merge", "push")


class GitAgent(Agent):
    """Read-only git status/branch/log for this repo.

    Push/merge/PR creation are intentionally not implemented for real yet —
    they're simulated and routed through the approval queue so the safety
    gate exists before the real (riskier) implementation lands.
    """

    name = "GitAgent"
    description = "Git status, branch, and log for this repo."

    def can_handle(self, command: str) -> bool:
        text = command.lower()
        return "git" in text or any(keyword in text for keyword in (*_RISKY_KEYWORDS, "branch", "diff"))

    async def handle(self, command: str) -> AgentResult:
        text = command.lower()

        if any(keyword in text for keyword in _RISKY_KEYWORDS):
            return self._simulate_risky_action(command)
        if "branch" in text:
            return self._branch()
        if "log" in text or "commit" in text:
            return self._log()
        if "diff" in text:
            return self._diff()
        return self._status()

    def _run(self, *args: str) -> str:
        result = subprocess.run(
            ["git", *args],
            cwd=settings.repo_path,
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode != 0:
            return f"git {' '.join(args)} failed: {result.stderr.strip()}"
        return result.stdout.strip()

    def _status(self) -> AgentResult:
        branch = self._run("rev-parse", "--abbrev-ref", "HEAD")
        short_status = self._run("status", "--short")
        files = short_status.splitlines() if short_status else []
        summary = (
            f"On branch {branch}. {len(files)} changed file(s)."
            if files
            else f"On branch {branch}. Working tree clean."
        )
        return AgentResult(agent=self.name, response=summary, data={"branch": branch, "changed_files": files})

    def _branch(self) -> AgentResult:
        current = self._run("rev-parse", "--abbrev-ref", "HEAD")
        all_branches = self._run("branch", "--list")
        return AgentResult(
            agent=self.name,
            response=f"Current branch: {current}",
            data={"current": current, "branches": all_branches.splitlines()},
        )

    def _log(self) -> AgentResult:
        log = self._run("log", "--oneline", "-10")
        commits = log.splitlines() if log else []
        response = "Last {} commit(s):\n{}".format(len(commits), "\n".join(commits)) if commits else "No commits found."
        return AgentResult(agent=self.name, response=response, data={"commits": commits})

    def _diff(self) -> AgentResult:
        diff_stat = self._run("diff", "--stat")
        return AgentResult(agent=self.name, response=diff_stat or "No unstaged changes.", data={"diff_stat": diff_stat})

    def _simulate_risky_action(self, command: str) -> AgentResult:
        return AgentResult(
            agent=self.name,
            response=(
                "[SIMULATED] This MVP doesn't perform real pushes, merges, or PR creation yet. "
                f"Queuing for approval as a demo of the safety gate for: '{command}'."
            ),
            requires_approval=True,
            action="git.risky_action",
            data={"command": command},
        )
