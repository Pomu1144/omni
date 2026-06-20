import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

# backend/app/config.py -> parents[1] is the "backend" dir, parents[2] is the repo root.
_BACKEND_DIR = Path(__file__).resolve().parents[1]
_DEFAULT_REPO_PATH = str(_BACKEND_DIR.parent)

# Load backend/.env explicitly (regardless of the process's current working
# directory) so ELEVENLABS_API_KEY etc. are picked up without exporting them
# manually. Safe to call even if the file doesn't exist.
load_dotenv(_BACKEND_DIR / ".env")


def _split_csv(value: str) -> list[str]:
    return [origin.strip() for origin in value.split(",") if origin.strip()]


@dataclass(frozen=True)
class Settings:
    ollama_url: str = field(default_factory=lambda: os.environ.get("OLLAMA_URL", "http://localhost:11434"))
    ollama_model: str = field(default_factory=lambda: os.environ.get("OLLAMA_MODEL", "llama3"))
    ollama_timeout_seconds: float = field(default_factory=lambda: float(os.environ.get("OLLAMA_TIMEOUT_SECONDS", "5")))
    cors_origins: list[str] = field(
        default_factory=lambda: _split_csv(os.environ.get("CORS_ORIGINS", "http://localhost:5173"))
    )
    repo_path: str = field(default_factory=lambda: os.environ.get("OMNI_REPO_PATH", _DEFAULT_REPO_PATH))
    activity_log_limit: int = 200

    # Voice output (ElevenLabs text-to-speech). See backend/.env.example.
    elevenlabs_api_key: str = field(default_factory=lambda: os.environ.get("ELEVENLABS_API_KEY", ""))
    elevenlabs_voice_id: str = field(
        default_factory=lambda: os.environ.get("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB")
    )
    elevenlabs_model_id: str = field(default_factory=lambda: os.environ.get("ELEVENLABS_MODEL_ID", "eleven_turbo_v2_5"))


settings = Settings()
