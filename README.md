# EAMS Frontend — Enterprise Asset Management System

React 19 · Vite · React Router · Bootstrap 5 · Recharts

Web app for managing company assets: requests and approvals, assignments, damage reports with
photos and AI assessment, maintenance, QR scanning, stock-take audits, insights and live notifications.
Works with the [EAMS backend](../eams-backend).

## Getting started

Requirements: Node 20+ and a running EAMS backend (default `http://localhost:8080`).

```bash
npm install
cp .env.example .env.local   # optional, defaults work for local development
npm run dev
```

Open http://localhost:5173.

For a demo, start the backend with demo data (`SEED_DEMO_DATA=true`) and set
`VITE_DEMO_MODE=true` to get one-click logins (Admin / Manager / Employee / Technician).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |
| `npm test` | Unit tests (Vitest) |

## Configuration

The page always calls `/api` on **its own address**, and Vite forwards `/api` and `/uploads` to the
backend (see `vite.config.js`). The same build therefore works on localhost, on other computers
in the network, and through a Cloudflare tunnel, with no CORS settings.

| Variable | Default | Purpose |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8080` | Where Vite forwards `/api` and `/uploads` |
| `ALLOWED_HOSTS` | - | Extra host names allowed to open the app (e.g. your own domain). `*.trycloudflare.com` and `*.ngrok-free.app` are already allowed |
| `VITE_API_URL` | *(empty = same address)* | Only set it to call a backend directly without forwarding |
| `VITE_DEMO_MODE` | `false` | Show demo login buttons. Keep it **false** while the app is public |
| `VITE_DEMO_PASSWORD` | `Password123!` | Password of the seeded demo accounts |

Only `VITE_*` variables are exposed to the browser. Never put secrets here.

### Demo / show day
From the `Projects` folder: `.\start-demo.ps1 -Mode Local | Lan | Public` starts the backend, the
production frontend and (Public) a free HTTPS Cloudflare tunnel. Stop it with `.\stop-demo.ps1`.

## Main features

| Feature | Where |
|---|---|
| Role dashboards (admin, manager, employee, technician) | `/dashboard` |
| Asset list with combined filters, QR labels (PDF), health score, lifecycle timeline | `/assets`, `/assets/:id` |
| **Scan a QR sticker** → mobile page with the actions this user may take | `/a/:assetCode`, `/scan` |
| Requests (specific asset or "any item of a category"), approval, assignment | `/requests`, `/requests/pending`, `/requests/approved` |
| Damage reports with camera photos and **AI assessment** | `/damage`, `/damage/:id` |
| Technician job board | `/maintenance/my` |
| **Insights**: replace-soon list, money at risk, idle assets, warranties | `/insights` |
| **Ask EAMS** AI assistant (admin / manager, when AI is configured on the backend) | button bottom-right |
| Stock-take audits (find missing / misplaced assets) | `/audits` |
| Live notifications (bell, Server-Sent Events) | top bar, `/notifications` |
| Users & invitations, audit log | `/users`, `/audit-log` |
| Forgot / reset password, invitation acceptance | `/forgot-password`, `/reset-password` |

## Project structure

```
src/
  config.js            environment settings (API URL, demo mode)
  context/             AuthContext (login state, session expiry)
  routes/              routes + role guards (all pages lazy-loaded)
  services/            API clients (one per backend area); api.js = shared axios instance
  components/
    common/            StatusBadge, DetailRow, PageLoader, Feedback (toasts + confirm), ErrorBoundary
    ai/                AiTriageCard, AskEamsDrawer, Markdown (safe renderer)
    assets/            AssetForm, HealthGauge, AssetTimeline
    ...
  pages/               one folder per area
  utils/               apiError, format, jwt, sse, markdown, scan, hooks (+ unit tests)
```

## Conventions

- **Errors:** always show `getErrorMessage(err, "fallback")`, never `err.response.data` directly.
- **Dates / money / enums:** use `utils/format.js` (`formatDate`, `formatMoney`, `formatEnum`).
- **Status colours:** `<StatusBadge value={...} />`.
- **Confirmations and messages:** `useConfirm()` and `useToast()`, not `window.confirm` / `alert`.
- **Identity:** never send user or employee ids to the API; the backend reads them from the token.
- **Session expiry:** handled globally (401 → login with "session expired").

## Deployment note

`npm run build` + `npm run preview` serves the production build *and* forwards `/api` (used by the
demo scripts). Behind another web server (e.g. nginx), serve `index.html` for unknown paths
(`try_files $uri /index.html;`) and proxy `/api` and `/uploads` to the backend.
