# Omni Command Center

A personal AI workflow operating system, not a chatbot: one orchestrator
(`OmniCore`) routing commands to specialized agents, with a dashboard
designed to live on its own monitor.

**Safety rule:** Omni prepares, compares, drafts, navigates, and automates —
any purchase, payment, booking, ride request, cancellation, email send, PR
merge, push, or destructive action must go through the approval queue and
get explicit user confirmation. See [docs/SPEC.md](docs/SPEC.md) for the full
product vision and [docs/ROADMAP.md](docs/ROADMAP.md) for what's actually
built so far versus what's still planned.

This repo currently has the foundation only: a FastAPI backend with a
command router and two agents (git status/branch/log, and a local-Ollama
fallback), a WebSocket event stream, an approval queue, voice input/output,
and a React + TypeScript dashboard. Browser automation, reservations, and
the email/calendar/Jira integrations described in the spec are not built
yet.

## Architecture

```
backend/   FastAPI app: OmniCore router, agents, approval queue, WebSocket
frontend/  React + TypeScript dashboard (Vite)
docs/      Product spec and roadmap
```

Commands flow: dashboard → `POST /api/command` → `OmniCore.route()` picks
the first agent whose `can_handle()` matches → agent returns a result → if
the result is marked `requires_approval`, it's queued instead of executed
and surfaced in the Approval Queue panel; otherwise it's broadcast on the
`/ws/events` WebSocket and shown in the activity feed.

## Running locally

### Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Runs on `http://localhost:8000`. Optional env vars: `OLLAMA_URL` (default
`http://localhost:11434`), `OLLAMA_MODEL` (default `llama3`), `CORS_ORIGINS`
(default `http://localhost:5173`).

To hear Omni speak its responses (Voice Mode output), copy
`backend/.env.example` to `backend/.env` and set `ELEVENLABS_API_KEY` to a
key from [elevenlabs.io](https://elevenlabs.io/app/settings/api-keys).
`backend/.env` is gitignored and only read locally. Without it, voice input
and typed commands still work, but responses stay text-only and the
dashboard shows a "voice output not configured" notice.

Run tests with `.venv/bin/pytest`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. Copy `.env.example` to `.env` to point it at
a non-default backend URL (`VITE_API_BASE_URL`).

Voice Mode input (the mic button) uses the browser's built-in Speech
Recognition API, which is only available in Chrome and Edge — other browsers
fall back to typed commands with a clear "not supported" notice. Voice
output is proxied through the backend's ElevenLabs integration; see the
backend setup above.

### Optional: local Ollama

The `OllamaAgent` is a catch-all for anything the other agents don't claim.
Without Ollama running, it degrades to a clear "not reachable" message
instead of failing. To enable it: install [Ollama](https://ollama.com), run
`ollama serve`, and `ollama pull llama3` (or set `OLLAMA_MODEL` to whatever
you pulled).

## Adding an agent

Implement `Agent` (`backend/app/agents/base.py`): `can_handle(command) ->
bool` and `async handle(command) -> AgentResult`. Register it in
`backend/app/router.py`'s agent list — order matters, first match wins, and
`OllamaAgent` must stay last as the catch-all. If the action is risky (sends,
payments, bookings, pushes, merges, deletes — see the safety rules in
[docs/SPEC.md](docs/SPEC.md#12-safety-and-approval-features-mandatory)),
return `AgentResult(requires_approval=True, action=..., ...)` instead of
performing it directly; the router will route it through the approval queue
for you.
