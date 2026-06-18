from abc import ABC, abstractmethod

from app.models import AgentResult


class Agent(ABC):
    name: str
    description: str

    @abstractmethod
    def can_handle(self, command: str) -> bool:
        """Whether this agent should handle the given command text."""

    @abstractmethod
    async def handle(self, command: str) -> AgentResult:
        """Handle the command and return a result for the router."""
