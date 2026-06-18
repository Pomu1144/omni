# Jarvis Command Center

A personal AI workflow operating system, not a chatbot: one orchestrator
(`JarvisCore`) routing commands to specialized agents, with a dashboard
designed to live on its own monitor.

**Safety rule:** Jarvis prepares, compares, drafts, navigates, and automates —
any purchase, payment, booking, ride request, cancellation, email send, PR
merge, push, or destructive action must go through the approval queue and
get explicit user confirmation. See [docs/SPEC.md](docs/SPEC.md) for the full
product vision and [docs/ROADMAP.md](docs/ROADMAP.md) for what's actually
built so far versus what's still planned.

This repo currently has the foundation only: a FastAPI backend with a
command router and two agents (git status/branch/log, and a local-Ollama
fallback), a WebSocket event stream, an approval queue, and a React +
TypeScript dashboard. Voice, browser automation, reservations, and the
email/calendar/Jira integrations described in the spec are not built yet.

## Architecture

```
backend/   FastAPI app: JarvisCore router, agents, approval queue, WebSocket
frontend/  React + TypeScript dashboard (Vite)
docs/      Product spec and roadmap
```

Commands flow: dashboard → `POST /api/command` → `JarvisCore.route()` picks
the first agent whose `can_handle()` matches → agent returns a result → if
the result is marked `requires_approval`, it's queued instead of executed
and surfaced in the Approval Queue panel; otherwise it's broadcast on the
`/ws/events` WebSocket and shown in the activity feed.

## Running locally

One-time setup, then a single command starts both the backend and frontend:

```bash
npm run setup   # creates backend/.venv, installs Python + frontend deps
npm run dev     # runs uvicorn (:8000) and vite (:5173) together
```

Frontend is on `http://localhost:5173`, backend on `http://localhost:8000`.
`npm run dev` uses `concurrently` (declared in the root `package.json`) to run
both processes in one terminal with labeled, color-coded output; `Ctrl+C`
stops both.

If you'd rather run them separately (e.g. for backend-only debugging):

```bash
# backend
cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

# frontend
npm --prefix frontend run dev
```

Optional backend env vars: `OLLAMA_URL` (default `http://localhost:11434`),
`OLLAMA_MODEL` (default `llama3`), `CORS_ORIGINS` (default
`http://localhost:5173`). Run backend tests with `backend/.venv/bin/pytest`.

Copy `frontend/.env.example` to `frontend/.env` to point the dashboard at a
non-default backend URL (`VITE_API_BASE_URL`).

### Voice (listening + speaking)

The dashboard's Voice panel uses the browser-native Web Speech API: tap "Hold
to talk to Jarvis" to dictate a command (same path as typing one), and toggle
"Speak replies aloud" to have responses read back via speech synthesis. This
needs **Chrome or Edge** (Firefox/Safari don't implement `SpeechRecognition`)
and microphone permission — no API keys or cloud services involved. There's
no wake word or always-on listening yet; every command needs a tap.

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
