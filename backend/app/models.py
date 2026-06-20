import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _new_id() -> str:
    return uuid.uuid4().hex[:12]


class CommandRequest(BaseModel):
    text: str


class SpeakRequest(BaseModel):
    text: str


class AgentResult(BaseModel):
    agent: str
    response: str
    requires_approval: bool = False
    action: str | None = None
    data: dict[str, Any] | None = None


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class PendingApproval(BaseModel):
    id: str = Field(default_factory=_new_id)
    agent: str
    action: str
    summary: str
    detail: str
    status: ApprovalStatus = ApprovalStatus.PENDING
    created_at: datetime = Field(default_factory=_now)
    resolved_at: datetime | None = None


class ApprovalDecision(BaseModel):
    approve: bool


class ActivityEvent(BaseModel):
    id: str = Field(default_factory=_new_id)
    type: str
    timestamp: datetime = Field(default_factory=_now)
    payload: dict[str, Any] = Field(default_factory=dict)


class WorkflowButton(BaseModel):
    id: str
    label: str
    command: str
    description: str = ""
