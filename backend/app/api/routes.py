import httpx
from fastapi import APIRouter, HTTPException

from app import state
from app.approval import ApprovalAlreadyResolved, ApprovalNotFound
from app.config import settings
from app.events import activity_log, publish
from app.models import ApprovalDecision, CommandRequest

router = APIRouter(prefix="/api")


@router.get("/health")
async def health() -> dict:
    ollama_reachable = False
    try:
        async with httpx.AsyncClient(timeout=min(settings.ollama_timeout_seconds, 1.5)) as client:
            response = await client.get(f"{settings.ollama_url}/api/tags")
            ollama_reachable = response.status_code == 200
    except httpx.HTTPError:
        ollama_reachable = False
    return {"status": "ok", "ollama_reachable": ollama_reachable}


@router.get("/agents")
async def list_agents() -> list[dict]:
    return state.router.agent_info()


@router.get("/workflows")
async def list_workflows() -> list[dict]:
    return [button.model_dump() for button in state.workflow_buttons]


@router.get("/activity")
async def list_activity(count: int = 50) -> list[dict]:
    return [event.model_dump(mode="json") for event in activity_log.recent(count)]


@router.post("/command")
async def run_command(request: CommandRequest) -> dict:
    await publish("command_received", {"text": request.text})
    result = await state.router.route(request.text)

    if result.requires_approval:
        approval = state.approvals.create(
            agent=result.agent,
            action=result.action or "unknown",
            summary=result.response,
            detail=request.text,
        )
        await publish("approval_requested", approval.model_dump(mode="json"))
        return {"status": "pending_approval", "approval_id": approval.id, "summary": approval.summary}

    await publish("agent_result", result.model_dump(mode="json"))
    return {"status": "completed", "agent": result.agent, "response": result.response, "data": result.data}


@router.get("/approvals")
async def list_approvals() -> list[dict]:
    return [item.model_dump(mode="json") for item in state.approvals.list_all()]


@router.post("/approvals/{approval_id}/decision")
async def decide_approval(approval_id: str, decision: ApprovalDecision) -> dict:
    try:
        item = state.approvals.resolve(approval_id, decision.approve)
    except ApprovalNotFound:
        raise HTTPException(status_code=404, detail="Approval not found") from None
    except ApprovalAlreadyResolved:
        raise HTTPException(status_code=409, detail="Approval already resolved") from None

    await publish("approval_resolved", item.model_dump(mode="json"))
    return item.model_dump(mode="json")
