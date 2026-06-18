import asyncio
import logging

from fastapi import WebSocket

from app.config import settings
from app.models import ActivityEvent

logger = logging.getLogger("jarvis.events")


class ActivityLog:
    """In-memory ring buffer of recent activity, for clients that connect after events fired."""

    def __init__(self, limit: int = settings.activity_log_limit) -> None:
        self._limit = limit
        self._events: list[ActivityEvent] = []

    def record(self, event: ActivityEvent) -> None:
        self._events.append(event)
        if len(self._events) > self._limit:
            self._events = self._events[-self._limit :]

    def recent(self, count: int = 50) -> list[ActivityEvent]:
        return self._events[-count:]


class ConnectionManager:
    """Tracks active dashboard WebSocket connections and broadcasts events to all of them."""

    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.add(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections.discard(websocket)

    async def broadcast(self, event: ActivityEvent) -> None:
        dead: list[WebSocket] = []
        async with self._lock:
            connections = list(self._connections)
        for connection in connections:
            try:
                await connection.send_text(event.model_dump_json())
            except Exception:
                dead.append(connection)
        if dead:
            async with self._lock:
                for connection in dead:
                    self._connections.discard(connection)


activity_log = ActivityLog()
connection_manager = ConnectionManager()


async def publish(event_type: str, payload: dict) -> ActivityEvent:
    event = ActivityEvent(type=event_type, payload=payload)
    activity_log.record(event)
    await connection_manager.broadcast(event)
    logger.info("event %s: %s", event_type, payload)
    return event
