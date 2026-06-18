import pytest

from app.agents.git_agent import GitAgent


@pytest.fixture
def agent() -> GitAgent:
    return GitAgent()


def test_can_handle_git_commands(agent: GitAgent) -> None:
    assert agent.can_handle("git status")
    assert agent.can_handle("what's my current branch?")
    assert not agent.can_handle("find dinner near me")


@pytest.mark.asyncio
async def test_status_reports_branch(agent: GitAgent) -> None:
    result = await agent.handle("git status")
    assert result.agent == "GitAgent"
    assert "branch" in result.response.lower()
    assert not result.requires_approval


@pytest.mark.asyncio
async def test_risky_action_requires_approval(agent: GitAgent) -> None:
    result = await agent.handle("git open pr")
    assert result.requires_approval
    assert result.action == "git.risky_action"
    assert "SIMULATED" in result.response
