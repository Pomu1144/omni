import os
from dataclasses import dataclass, field
from pathlib import Path

# backend/app/config.py -> parents[1] is the "backend" dir, parents[2] is the repo root.
_DEFAULT_REPO_PATH = str(Path(__file__).resolve().parents[2])


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
    repo_path: str = field(default_factory=lambda: os.environ.get("JARVIS_REPO_PATH", _DEFAULT_REPO_PATH))
    activity_log_limit: int = 200


settings = Settings()
