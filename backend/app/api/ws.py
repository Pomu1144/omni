from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.events import connection_manager

router = APIRouter()


@router.websocket("/ws/events")
async def events_websocket(websocket: WebSocket) -> None:
    await connection_manager.connect(websocket)
    try:
        while True:
            # Dashboard doesn't send anything meaningful today; just keep the
            # connection open and notice disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        await connection_manager.disconnect(websocket)
