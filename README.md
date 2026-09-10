# WealthWise

AI-Powered Personal Wealth Planner — Unified Financial Tracking, Explainable Scoring & Goal-Aware Advisory.

## Architecture

Modular monolith (Node.js / Express) with a React frontend. Design specs live in `docs/`:

- `WealthWise_Database_Schema_and_System_Architecture.docx` — database schema, core stack & folder structure
- `WealthWise_Role_and_Page_Wise_Feature_Map.docx` — role-wise & page-wise features

## Stack

- **Frontend**: React + TypeScript, Vite, TailwindCSS, Recharts, Axios
- **Backend**: Node.js, Express.js (REST API)
- **Database**: Supabase (PostgreSQL) — schema: `database/migrations/V1__init_wealthwise_schema.sql`
- **AI layer**: OpenAI / Gemini (swappable via `AI_PROVIDER` config)
- **Cache/queues**: Redis (score cache + JWT blacklist)

## Folder structure

```
├── .github/workflows/       CI & CD pipelines
├── docker/                  Compose + Dockerfiles
├── database/                Migrations (PostgreSQL) & seeds
├── backend/                 Express REST API
│   └── src/
│       ├── config/          db (pg pool), ai-provider adapter
│       ├── modules/         auth, finances, wealth-score, stress-test,
│       │                    goals, advisor, dashboard
│       ├── jobs/            recalculation job (BR-03, BR-05)
│       ├── middleware/      auth + validation
│       ├── common/          errors, audit log writer
│       ├── app.js
│       └── server.js
├── frontend/                React SPA
│   └── src/
│       ├── components/
│       ├── context/         AuthContext
│       ├── hooks/
│       ├── pages/           dashboard, finances, wealth-score, stress-test,
│       │                    goals, advisor, settings
│       └── services/        Axios API clients
└── docs/
```

## Getting started

1. Copy `backend/.env.example` to `backend/.env` and fill in Supabase credentials.
2. `cd backend && npm install && npm run dev`
3. `cd frontend && npm install && npm run dev`

## Disclaimer

AI-generated content is informational and not certified financial advice.