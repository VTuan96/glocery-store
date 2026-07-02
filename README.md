# GroceryStore

Offline-first PWA POS system for small rural grocery stores in Vietnam.

## Project Structure

```
grocery-store/
├── backend/        # Spring Boot REST API (Java 21)
├── frontend/       # React PWA (TypeScript + Vite)
├── docker-compose.yml
└── .github/workflows/
```

## Quick Start (Local Dev)

### 1. Start the full stack with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:8080
- Health check: http://localhost:8080/actuator/health
- PostgreSQL: localhost:5432

> Only Docker Desktop is required on the host machine.
> The frontend is built into a static container and proxies `/api` to the backend service automatically.

### 2. Frontend development mode (optional)

```bash
cd frontend
npm install
npm run dev
```

- Frontend dev server: http://localhost:5173

> This is only needed if you want to work on frontend code with Vite hot reload.

### Default login PINs (seeded on first run)

| Role  | PIN    |
|-------|--------|
| Owner | `1234` |

> No staff accounts are pre-seeded. Log in as Owner and go to **Settings** to create staff accounts.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Workbox PWA, Dexie.js, Zustand, TanStack Query, MUI v5
- **Backend:** Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA, Flyway
- **Database:** PostgreSQL 16

## Frontend Dev Commands

```bash
cd frontend
npm run dev          # start dev server (http://localhost:5173)
npm run test         # run unit tests
npm run type-check   # TypeScript type check
npm run lint         # ESLint
npm run build        # production build
```

## Required GitHub Secrets (for CI/CD)

| Secret | Description |
|--------|-------------|
| `VITE_API_BASE_URL` | Production API base URL (e.g. `https://api.yourapp.com/api/v1`) |
| `VERCEL_TOKEN` | Vercel deploy token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `RAILWAY_TOKEN` | Railway deploy token |
