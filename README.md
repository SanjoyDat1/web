# Penlo Web

Enterprise dashboard for the Penlo knowledge graph. Visualizes the company brain, manages teams and invitations, and surfaces real-time updates from all connected data sources.

Part of the [penlo-hq](https://github.com/penlo-hq) organization.

| Repo | Description |
|------|-------------|
| [penlo-hq/brain](https://github.com/penlo-hq/brain) | FastAPI backend |
| **penlo-hq/web** (this repo) | React dashboard |
| [penlo-hq/flow](https://github.com/penlo-hq/flow) | iOS app |

---

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · d3-force · Three.js · Framer Motion · Zustand · Axios

---

## Running Locally

```bash
cp .env.example .env.local
# set VITE_API_URL and VITE_WS_URL to your brain backend URL
npm install
npm run dev
```

App runs at `http://localhost:5173`. Proxies `/api` to `http://localhost:8000` in dev mode.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Brain backend URL (e.g. `https://your-brain.railway.app`) |
| `VITE_WS_URL` | WebSocket URL (same host, `wss://` scheme) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (optional — enables Google sign-in button) |

Set these in the Vercel dashboard for production deployments.

---

## Deploying to Vercel

1. Connect `penlo-hq/web` to a new Vercel project
2. Add environment variables in Vercel dashboard (see above)
3. Deploy — `vercel.json` handles SPA routing rewrites

---

## Features

- **Company Brain** — 3D force graph of the knowledge graph with cluster halos and timeline scrubber
- **My Brain** — personal subgraph filtered to your context
- **Ask the Brain** — natural language query against the full graph
- **Activity Feed** — real-time stream of graph updates via WebSocket
- **Tasks** — task nodes extracted from conversations
- **Drafts** — AI-generated document drafts from brain context
- **Admin Dashboard** — brain health, node counts, user activity, Slack status
- **Team Management** — create teams, manage members, generate invite links
- **Google Sign-in** — OAuth flow gated on `VITE_GOOGLE_CLIENT_ID`
- **Invite Accept** — public `/invite/:token` page for new user onboarding
