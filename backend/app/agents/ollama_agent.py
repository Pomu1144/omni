import httpx

from app.agents.base import Agent
from app.config import settings
from app.models import AgentResult


class OllamaAgent(Agent):
    """Catch-all agent: forwards anything no other agent claims to a local Ollama server.

    Degrades to a clear, non-fatal message if Ollama isn't running or
    unreachable rather than failing the request.
    """

    name = "OllamaAgent"
    description = "General chat via a local Ollama model. Falls back gracefully if Ollama isn't running."

    def can_handle(self, command: str) -> bool:
        return True

    async def handle(self, command: str) -> AgentResult:
        url = f"{settings.ollama_url}/api/generate"
        try:
            async with httpx.AsyncClient(timeout=settings.ollama_timeout_seconds) as client:
                response = await client.post(
                    url,
                    json={"model": settings.ollama_model, "prompt": command, "stream": False},
                )
                response.raise_for_status()
                payload = response.json()
        except httpx.ConnectError:
            return AgentResult(
                agent=self.name,
                response=(
                    f"Local Ollama isn't reachable at {settings.ollama_url}. "
                    "Start it with `ollama serve` (and `ollama pull "
                    f"{settings.ollama_model}`) to enable AI chat responses."
                ),
            )
        except httpx.HTTPStatusError as exc:
            return AgentResult(
                agent=self.name,
                response=f"Ollama returned an error ({exc.response.status_code}). Is model '{settings.ollama_model}' pulled?",
            )
        except httpx.TimeoutException:
            return AgentResult(
                agent=self.name,
                response=f"Ollama at {settings.ollama_url} timed out after {settings.ollama_timeout_seconds}s.",
            )

        text = payload.get("response", "").strip() or "(Ollama returned an empty response.)"
        return AgentResult(agent=self.name, response=text, data={"model": settings.ollama_model})
