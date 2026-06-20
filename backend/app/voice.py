import httpx

from app.config import settings

_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

# Keeps latency and ElevenLabs usage bounded; agent responses are normally
# far shorter than this, this just guards against a runaway prompt.
_MAX_TEXT_LENGTH = 800


class VoiceSynthesisError(Exception):
    """Raised when ElevenLabs text-to-speech can't be used or fails."""


def is_configured() -> bool:
    return bool(settings.elevenlabs_api_key)


async def synthesize_speech(text: str) -> bytes:
    """Call ElevenLabs TTS and return MP3 audio bytes for the given text."""
    if not is_configured():
        raise VoiceSynthesisError(
            "ELEVENLABS_API_KEY is not set. Copy backend/.env.example to backend/.env and add your key."
        )

    clipped = text.strip()[:_MAX_TEXT_LENGTH]
    if not clipped:
        raise VoiceSynthesisError("No text to speak.")

    url = _TTS_URL.format(voice_id=settings.elevenlabs_voice_id)
    headers = {
        "xi-api-key": settings.elevenlabs_api_key,
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
    }
    payload = {
        "text": clipped,
        "model_id": settings.elevenlabs_model_id,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.content
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:200] if exc.response is not None else str(exc)
        raise VoiceSynthesisError(f"ElevenLabs returned {exc.response.status_code}: {detail}") from exc
    except httpx.HTTPError as exc:
        raise VoiceSynthesisError(f"Couldn't reach ElevenLabs: {exc}") from exc
