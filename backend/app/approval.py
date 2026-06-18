from datetime import datetime, timezone

from app.models import ApprovalStatus, PendingApproval


class ApprovalAlreadyResolved(Exception):
    pass


class ApprovalNotFound(Exception):
    pass


class ApprovalStore:
    """In-memory queue of actions awaiting human approval.

    Any agent action that is risky per the safety rules (sends, payments,
    bookings, pushes, merges, deletes, ...) must go through this store
    instead of executing directly. Resolution only flips status today;
    wiring a resolved approval to the agent's real side effect is on each
    agent as those risky actions get built out.
    """

    def __init__(self) -> None:
        self._items: dict[str, PendingApproval] = {}

    def create(self, agent: str, action: str, summary: str, detail: str) -> PendingApproval:
        item = PendingApproval(agent=agent, action=action, summary=summary, detail=detail)
        self._items[item.id] = item
        return item

    def get(self, approval_id: str) -> PendingApproval:
        try:
            return self._items[approval_id]
        except KeyError:
            raise ApprovalNotFound(approval_id) from None

    def list_pending(self) -> list[PendingApproval]:
        return [item for item in self._items.values() if item.status == ApprovalStatus.PENDING]

    def list_all(self, limit: int = 50) -> list[PendingApproval]:
        return sorted(self._items.values(), key=lambda item: item.created_at, reverse=True)[:limit]

    def resolve(self, approval_id: str, approve: bool) -> PendingApproval:
        item = self.get(approval_id)
        if item.status != ApprovalStatus.PENDING:
            raise ApprovalAlreadyResolved(approval_id)
        item.status = ApprovalStatus.APPROVED if approve else ApprovalStatus.REJECTED
        item.resolved_at = datetime.now(timezone.utc)
        self._items[approval_id] = item
        return item
