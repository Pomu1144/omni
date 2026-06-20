import pytest

from app.router import OmniCore


@pytest.mark.asyncio
async def test_git_command_routes_to_git_agent() -> None:
    router = OmniCore()
    result = await router.route("git branch")
    assert result.agent == "GitAgent"


@pytest.mark.asyncio
async def test_unmatched_command_falls_back_to_ollama() -> None:
    router = OmniCore()
    result = await router.route("tell me a joke")
    assert result.agent == "OllamaAgent"
    # No Ollama server in CI/sandbox, so this should degrade gracefully, not raise.
    assert isinstance(result.response, str) and result.response
