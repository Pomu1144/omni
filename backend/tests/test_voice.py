from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_voice_status_not_configured_by_default() -> None:
    # No ELEVENLABS_API_KEY in CI/sandbox, so this should degrade gracefully.
    response = client.get("/api/voice/status")
    assert response.status_code == 200
    body = response.json()
    assert body["configured"] is False
    assert "voice_id" in body


def test_speak_returns_503_when_not_configured() -> None:
    response = client.post("/api/voice/speak", json={"text": "Hello from Jarvis."})
    assert response.status_code == 503
    assert "ELEVENLABS_API_KEY" in response.json()["detail"]
