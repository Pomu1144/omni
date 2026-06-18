from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_workflows_listed() -> None:
    response = client.get("/api/workflows")
    assert response.status_code == 200
    ids = {item["id"] for item in response.json()}
    assert "git-status" in ids


def test_command_completes_for_git_status() -> None:
    response = client.post("/api/command", json={"text": "git status"})
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["agent"] == "GitAgent"


def test_risky_command_creates_pending_approval() -> None:
    response = client.post("/api/command", json={"text": "git open pr"})
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "pending_approval"
    approval_id = body["approval_id"]

    pending = client.get("/api/approvals").json()
    assert any(item["id"] == approval_id and item["status"] == "pending" for item in pending)

    decision = client.post(f"/api/approvals/{approval_id}/decision", json={"approve": True})
    assert decision.status_code == 200
    assert decision.json()["status"] == "approved"

    # Resolving twice should fail.
    repeat = client.post(f"/api/approvals/{approval_id}/decision", json={"approve": True})
    assert repeat.status_code == 409


def test_unknown_approval_404() -> None:
    response = client.post("/api/approvals/does-not-exist/decision", json={"approve": True})
    assert response.status_code == 404
