from app.agents.base import Agent
from app.agents.git_agent import GitAgent
from app.agents.ollama_agent import OllamaAgent
from app.models import AgentResult


class JarvisCore:
    """Main command router. Tries agents in order; first match wins.

    OllamaAgent is the catch-all and must stay last.
    """

    def __init__(self, agents: list[Agent] | None = None) -> None:
        self.agents: list[Agent] = agents if agents is not None else [GitAgent(), OllamaAgent()]

    def agent_info(self) -> list[dict[str, str]]:
        return [{"name": agent.name, "description": agent.description} for agent in self.agents]

    async def route(self, text: str) -> AgentResult:
        for agent in self.agents:
            if agent.can_handle(text):
                return await agent.handle(text)
        return AgentResult(agent="JarvisCore", response="No agent could handle that command.")
