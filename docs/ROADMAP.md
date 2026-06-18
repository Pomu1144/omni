# Roadmap

Status against the [MVP build order](./SPEC.md#14-suggested-mvp-build-order) from the spec.
Checked items are scaffolded and working; unchecked items are not started.

- [x] 1. React dashboard — `frontend/` (Vite + React + TypeScript), three-panel layout
      mirroring the Monitor 2 "Jarvis Command Center" spec.
- [x] 2. FastAPI backend — `backend/` app with REST API.
- [x] 3. WebSocket live updates — `/ws/events`, broadcasts activity to the dashboard
      in real time.
- [x] 4. Local Ollama connection — `OllamaAgent` calls a local Ollama server if
      reachable, degrades to a clear "Ollama not running" message otherwise.
- [x] 5. Command router — `JarvisCore` dispatches text commands to the first agent
      that can handle them.
- [x] 6. Workflow buttons — `/api/workflows` + `WorkflowButtons` component fire
      canned commands.
- [x] 7. Git workflow (read-only slice) — `GitAgent` answers status/branch/log
      questions about this repo. Commit message/PR description generation,
      push/merge warnings, and the GitHub/Jira panels are not built yet.
- [x] 12. Approval queue (architecture, not all gated actions yet) — pending
      actions flow through `ApprovalStore`, surfaced in the dashboard with
      Approve/Reject. Only a simulated "open PR" demo action is gated on it
      today; future risky agents (real PR merges, sends, bookings, payments)
      must route through this same queue rather than acting directly.
- [x] 10–11. Voice input/output (browser-native, scaffolded) — push-to-talk
      mic button using the Web Speech API (`SpeechRecognition`) feeds
      transcripts straight into the same `sendCommand` path as typed text, and
      an animated orb (`VoiceOrb`) shows idle/listening/speaking state. A
      "Speak replies aloud" toggle uses `speechSynthesis` to read agent
      responses back. No wake word, no always-listening mode, and no cloud STT/
      TTS — this only works in Chrome/Edge, and needs a real microphone, so it
      can't be exercised headless in CI/sandbox runs.

Not started: 8 (Docs/TDD generator), 9 (Playwright browser automation), 13
(calendar/email integration), 14 (reservation assistant), 15 (persistent
memory — currently everything is in-memory and resets on restart), 16 (full
multi-agent routing — only GitAgent + OllamaAgent exist today).

## Why this slice first

Steps 1–6 plus a read-only Git agent and the approval-queue skeleton give a
runnable, end-to-end loop (UI → command → router → agent → WebSocket → UI)
without requiring any credentials or local services beyond an optional Ollama
install. Voice (needs STT/TTS keys or local models), browser automation (needs
Playwright + real sites to drive), and reservations/email (need real provider
accounts and explicit safety review) are deliberately deferred to their own
sessions rather than half-built here.

## Next suggested steps

1. Wire a real GitHub/Jira agent behind the existing approval queue (issue/PR
   drafting first, since those are read/draft operations; merges and pushes
   stay gated).
2. Add SQLite-backed memory so activity/approvals survive a restart (currently
   in-memory only).
3. Add the Docs/TDD generator agent (pure text generation, no external
   side effects, safe to build without new approval-gated actions).
4. Only after the above: Playwright browser automation, behind the same
   approval gate for anything beyond read-only navigation.
