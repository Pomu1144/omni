# Omni Command Center — Product Spec

This document is the full feature vision for the Omni Command Center, captured as
the source-of-truth product spec. It is intentionally aspirational and large — see
[ROADMAP.md](./ROADMAP.md) for what is actually built and in what order.

## Guiding system prompt

```txt
Build a local Omni-like AI command center for a triple-monitor software engineering and productivity setup.

The system should act as one main orchestrator with specialized workflow agents. It should support voice control, text commands, browser automation, Git/GitHub/Jira workflows, technical documentation generation, email/calendar assistance, restaurant and ride reservation preparation, local/private mode, cloud-enhanced mode, memory, and human approval gates.

The assistant should never finalize payments, bookings, ride requests, code pushes, PR merges, email sends, destructive file actions, or sensitive data sharing without explicit user confirmation.

The system should use a React + TypeScript frontend, FastAPI backend, WebSocket event streaming, local Ollama model support, optional cloud model support, Playwright for browser automation, SQLite for early memory, and a modular workflow-agent architecture.

The voice should sound like a calm, intelligent male assistant: professional, slightly deep, fast enough for work, but not robotic or overly dramatic.
```

**The most important part:** this is not "a chatbot." It's a personal AI workflow
operating system. Any purchase, payment, booking, ride request, cancellation, email
send, PR merge, or destructive action requires explicit user approval — Omni
prepares, compares, drafts, navigates, and automates, but does not finalize
consequential actions on its own.

## 1. Core Omni System

- Voice command input
- Text command input
- Wake word support
- Push-to-talk mode
- Always-listening mode, optional
- Local/private mode
- Cloud-enhanced mode
- Multi-monitor dashboard
- Workflow launcher
- Agent activity feed
- Approval queue
- Memory panel
- Task status panel
- Calendar/email/task summary
- Git/Jira/GitHub status panel
- Browser automation panel
- Reservation panel
- Error/log viewer
- "What am I working on?" context tracker
- "Resume from yesterday" mode
- Personal/work mode separation

## 2. Triple Monitor Layout

**Monitor 1 — Main Work Area**: VS Code, PyCharm, Browser, Jira, GitHub, AWS Q, Claude, Documents, local app testing.

**Monitor 2 — Omni Command Center**: voice/chat control, workflow buttons, current task, approval queue, agent logs, calendar summary, email summary, active ticket summary, browser automation state.

**Monitor 3 — Context and Automation View**: terminal output, git diffs, test logs, Playwright browser window, screenshots, meeting notes, technical design docs, error traces, research notes.

## 3. Voice System

**Input**: wake word ("Omni"), push-to-talk shortcut, always-listening optional mode, voice activity detection, noise suppression, command interruption, "stop"/"cancel" command, "repeat that" command, "explain simpler" command, "do not act, just explain" command, voice confirmation before risky actions, speech-to-text transcript log, local STT option, cloud STT option, meeting transcription mode, dictation mode for documents/emails.

**Output**: good male assistant voice, calm/confident/professional tone, low-latency streaming speech, adjustable speaking speed, short-answer mode, detailed-answer mode, whisper mode, meeting/work/casual mode voice, alert voice, error voice, confirmation voice, "do you want me to proceed?" voice prompt.

**Recommended voice stack**: best quality cloud — ElevenLabs; good OpenAI-native — OpenAI TTS / Realtime voice; best local/private — Piper TTS.

**Male voice persona**: calm, intelligent male voice with a confident but non-annoying tone — professional, slightly deep, fast enough for work, not robotic, avoids excessive personality unless casual mode is enabled.

## 4. Browser Control Automation

**General skills**: open websites, search Google, open specific tabs, read visible page content, summarize page, click buttons, fill forms, select dropdowns, download/upload files, take screenshots, extract tables/links, compare pages, monitor page changes, log console errors, capture network requests, run QA test flows, replay browser workflows, visible/headless mode, save session state, detect login pages, pause for human login, continue after login, handle MFA manually. **Never** bypass CAPTCHA, paywalls, or security prompts.

**Testing skills**: login flow testing, form validation testing, button click testing, navigation testing, screenshot capture, bug report generation, console error summary, broken link checker, network request failure checker, regression test runner, Playwright test generator, "record my browser actions" mode, "turn this manual test into automation" mode.

**Rule**: Omni can navigate and prepare actions but must stop before payment, purchase, booking confirmation, ride request confirmation, deleting data, submitting sensitive forms, sending messages, changing passwords, or approving financial transactions.

## 5. Reservation and Booking Skills

**Uber**: open Uber, compare ride types, estimate fare/pickup time, schedule ride, prepare pickup/dropoff/airport ride/Uber Reserve, compare UberX/Comfort/Black/XL, save common destinations, warn about surge pricing, check availability, ask for approval before booking, open final booking page for manual confirmation.

**Lyft**: open Lyft, estimate price/pickup time, schedule ride, compare options, prepare pickup/dropoff, save frequent places, warn about high prices, open final confirmation page, ask before booking.

**Ride safety**: Omni should always ask "I found a ride for $X arriving in Y minutes. Do you want me to open the final confirmation screen?" — never silently book.

**OpenTable**: search by city/cuisine/rating/price/date/time/party size, check availability, compare times, read reviews, suggest restaurants, open reservation page, prepare booking, ask for final approval.

**Resy**: search restaurants, check availability, open restaurant page, set notify alert if available, suggest alternatives, prepare reservation, redirect to Resy for final booking.

**General**: "find dinner for 2 near me at 7 PM", "find a birthday dinner under $50/person", "find Asian food near OSU", "find a quiet restaurant for a meeting", "find restaurants with parking/open now/that take reservations", "check OpenTable and Resy", "give me 3 options", "book the best one after I approve".

**Travel/appointments (later)**: hotel/flight/car rental search, barber/doctor/dentist appointments, gym class booking, study room booking, waitlist monitoring, event tickets, parking reservation, airport pickup planning, calendar-based travel prep. Omni prepares and guides, never finalizes payments without approval.

## 6. Work / Software Engineering Features

**Git**: branch/changed/uncommitted files, commits ahead of main, unrelated commits, generate commit message/PR title/PR description/test notes/rollback plan, compare branch to origin, warn before push/merge/rebase, explain git errors, suggest safe next git command.

**GitHub**: summarize issues, create issue/PR drafts, review PR diff, review CI errors, summarize code review comments, draft replies to reviewers, generate changelog, track assigned tickets, detect stale PRs, detect missing tests.

**Jira**: summarize ticket, generate sprint details/fix version notes/QA handoff/acceptance criteria/configuration notes/test scenarios/bug repro steps/blocker summary/daily standup update.

**Code understanding**: explain TypeScript/React/props/hooks/API calls/errors/stack traces/unfamiliar files/codebase structure, detect likely bug locations, generate test cases/documentation.

## 7. Documentation Features

**TDD generator**: background, problem statement, current/proposed behavior, user/system flow, API changes, DB changes, security considerations, edge cases, risks, rollback plan, testing plan, open questions.

**Work docs**: sprint summary, QA handoff, release notes, bug report, PR summary, meeting notes, daily/weekly work summary, manager update, architecture overview, onboarding documentation.

## 8. Email and Calendar Features

**Email**: summarize inbox, detect important emails, draft replies, rewrite professionally, shorten long emails, extract action items, create follow-up reminders, find old emails, summarize threads, draft but never send automatically.

**Calendar**: daily schedule summary, meeting prep, meeting notes template, travel time estimate, reminder generation, conflict detection, focus block creation, end-of-day recap, weekly planning, deadline tracking.

## 9. Personal Productivity Features

**Focus mode**: start deep work session, hide distractions, open only required apps, start timer, show current objective, track interruptions, summarize progress.

**Daily planning**: morning briefing, "what should I do now?", priority ranking, deadline review, calendar review, workload review, personal task review.

**End-of-day**: summarize what changed, summarize git commits, summarize open tasks, create tomorrow plan, save unfinished context, draft manager update.

## 10. Learning Features

Explain like I know nothing / junior dev / senior dev, quiz me mode, flashcard generator, error explainer, code walkthrough mode, math step-by-step mode, "what does this symbol mean?" mode, "give me the exam version" mode, "give me the work version" mode.

## 11. Personal Project Modes

**FIRUS Mode**: food resource data collection, map pin generation, route planning, accessibility planning, ASL/Braille feature documentation, grant proposal drafting, MVP roadmap, user story generation.

**Pulsori Mode**: patent notes, prior art tracking, hardware concept documentation, 8-dot Braille cell notes, prototype planning, research summaries, investor explanation.

**HER Circle / Nonprofit Website Mode**: website update planning, membership workflow, event workflow, volunteer/intern pipeline, contact export to Excel, admin dashboard planning, professional email drafting.

**Local LLM Lab Mode**: Ollama model manager, compare local models, route tasks by model size, run coding benchmark prompts, track speed/quality, local-only mode, multi-agent testing.

## 12. Safety and Approval Features (mandatory)

**Approval queue** — require approval before: sending email, sending text, booking rides, booking restaurants, paying money, submitting forms, creating PR, pushing code, merging code, deleting files, changing passwords, uploading files, sharing company code, calling cloud models with sensitive info.

**Privacy modes**:
- *Local Mode*: local models only, no cloud APIs, no company code sent externally, no screenshots/browser data sent externally.
- *Cloud Mode*: uses OpenAI/Claude/other APIs, redacts secrets first, requires confirmation for sensitive data.
- *Work Mode*: blocks personal automation, blocks unsafe browser actions, avoids cloud calls unless allowed.
- *Personal Mode*: allows restaurants, rides, calendar, personal project planning.

## 13. Agent Roles

One Omni controller, not independent bots:

- **OmniCore** — main router
- **VoiceAgent** — speech input/output
- **BrowserAgent** — browser control
- **CodeAgent** — code explanation
- **GitAgent** — branch/commit/PR support
- **JiraAgent** — ticket support
- **DocsAgent** — documentation
- **CalendarAgent** — schedule
- **EmailAgent** — email drafting
- **ReservationAgent** — restaurants/rides
- **TravelAgent** — trip planning
- **MemoryAgent** — remembers context
- **SafetyAgent** — approval and privacy control
- **ResearchAgent** — web research
- **QAAgent** — testing/browser automation

## 14. Suggested MVP Build Order

1. React dashboard
2. FastAPI backend
3. WebSocket live updates
4. Local Ollama connection
5. Command router
6. Workflow buttons
7. Git workflow
8. Docs/TDD workflow
9. Browser automation with Playwright
10. Voice input
11. Male voice output
12. Approval queue
13. Calendar/email integration
14. Reservation assistant
15. Memory system
16. Multi-agent routing

See [ROADMAP.md](./ROADMAP.md) for current status against this order.
