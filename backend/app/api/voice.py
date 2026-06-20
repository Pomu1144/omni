from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app import voice
from app.config import settings
from app.models import SpeakRequest

router = APIRouter(prefix="/api/voice")


@router.get("/status")
async def voice_status() -> dict:
    """Lets the frontend know whether TTS is usable, without exposing the key itself."""
    return {"configured": voice.is_configured(), "voice_id": settings.elevenlabs_voice_id}


@router.post("/speak")
async def speak(request: SpeakRequest) -> Response:
    try:
        audio = await voice.synthesize_speech(request.text)
    except voice.VoiceSynthesisError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from None
    return Response(content=audio, media_type="audio/mpeg")
