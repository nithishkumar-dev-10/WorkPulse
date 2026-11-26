# WorkPulse frontend

React + Vite + TypeScript dashboard for the WorkPulse attrition-prediction API.

## Run locally

```bash
cd frontend
npm install
cp .env.example .env   # optional: point VITE_API_URL at another API host
npm run dev            # http://localhost:5173
```

Authentication requires the backend `.env` (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN`). The frontend only needs `VITE_API_URL`; session cookies are sent with `credentials: "include"` and expired access tokens are refreshed once before retrying.

The API must be running separately from `workpulse/`:

```bash
cd workpulse
venv/bin/uvicorn api:app --reload --port 8000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server with HMR |
| `npm run build` | Type-check and production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint (flat config) |

## Pages

- **Predict** — 5-step form generated from `GET /schema`, animated risk gauge, SHAP factor chart, side-by-side model comparison.
- **Batch** — CSV upload/drag-and-drop, template download, preview, scoring via `POST /predict/batch`, charts, search/sort and CSV export.
- **History** — last 20 single assessments stored in browser local storage, with trend chart and reopen-to-predict.
- **About** — methodology, tuned thresholds, privacy notes and API connection.
- **Login / Signup** — account forms matching the dashboard theme; prediction pages require a session.

Configuration: `VITE_API_URL` (default `http://localhost:8000`). Explanations can be disabled server-side with `ENABLE_EXPLAIN=0`; the UI degrades gracefully.
