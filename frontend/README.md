# Jarvis Command Center — Dashboard

React + TypeScript (Vite) frontend for the Jarvis Command Center. See the
[repo root README](../README.md) for the full architecture and how to run
the backend it talks to.

```bash
npm install
npm run dev      # http://localhost:5173, expects the backend on :8000
npm run build    # type-check + production build
npm run lint
```

Set `VITE_API_BASE_URL` (see `.env.example`) if the backend isn't on the
default `http://localhost:8000`.
