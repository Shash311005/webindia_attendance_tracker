# Engineer Productivity & Attendance Tracker

This repository contains a full-stack application (Node/Express backend + React frontend) for tracking engineer productivity and attendance. The backend uses PostgreSQL and logs errors into a `logs` table.

This README lists the exact steps another developer should follow to run the project locally using the original/default values.

---

## Prerequisites

- Node.js (v18+ recommended) and `npm`
- PostgreSQL (server running locally or accessible remotely)
- PowerShell (Windows) or a POSIX shell (adjust commands accordingly)

---

## Repository layout

- `backend/` — Express API, DB init script, models, logger
- `frontend/` — React (Create React App) UI

---

## Backend: environment and defaults

Create `backend/.env` with the following original/default values (these are the defaults the code expects):

```
# backend/.env (defaults)
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=
PGDATABASE=engineer_tracker
PORT=4000
JWT_SECRET=dev_secret_change_me
DB_LOG_LEVEL=error
LOG_LEVEL=info
NODE_ENV=development
```

- `PGPASSWORD` is blank by default; set it if your Postgres user requires a password.
- Change `PORT` if you need to run the backend on a different port.

---

## Backend: database setup (Postgres)

1. Create the database (example using `psql`):

```powershell
# using the default `postgres` superuser
psql -U postgres -c "CREATE DATABASE engineer_tracker;"
```

2. (Optional) Create a dedicated DB user and grant ownership:

```powershell
psql -U postgres -c "CREATE USER engtracker WITH PASSWORD 'engpass';"
psql -U postgres -c "CREATE DATABASE engineer_tracker OWNER engtracker;"
# then set .env PGUSER=engtracker and PGPASSWORD=engpass
```

3. The repo contains `backend/init_db.js` which is idempotent and creates the required tables (`roles`, `users`, `logs`, `itin`). Run:

```powershell
cd backend
node init_db.js
# Expected output: "Postgres schema initialized (roles + users)"
```

---

## Backend: install and run

```powershell
cd backend
npm install
```

If port 4000 is in use, choose another port temporarily:

```powershell
$env:PORT=5001; npm start
```

Otherwise start normally:

```powershell
npm start
```

What to expect in the server console:
- The logger will attempt to remove legacy file logs (if present) and will persist `error` logs to the DB `logs` table.
- You should see `Backend listening on 4000` (or the chosen port).

If you see `EADDRINUSE`, another process is using the port. Identify and stop it:

```powershell
netstat -ano | findstr ":4000"
tasklist /FI "PID eq <PID>"
taskkill /PID <PID> /F
```

---

## Backend: quick API checks

- Ping endpoint:

```powershell
Invoke-RestMethod -Method GET http://localhost:4000/api/ping
# Expected: { "pong": true }
```

- Swagger docs: open `http://localhost:4000/api/docs` in your browser.

---

## Frontend: install and run

```powershell
cd frontend
npm install
```

If the backend is on a non-default host/port, set the API URL for CRA before starting:

```powershell
$env:REACT_APP_API_URL='http://localhost:4000'
npm start
```

Open `http://localhost:3000` in your browser. The app supports login/register and uses `localStorage` for session persistence.

---

## Verify logs & new `itin` table in Postgres

Run these queries using `psql` or your DB client:

```sql
-- Check that tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('logs','itin');

-- See recent error logs
SELECT id, level, message, meta, created_at FROM logs ORDER BY id DESC LIMIT 20;

-- See `itin` rows
SELECT * FROM itin LIMIT 10;
```

---

## Notes about logging

- The backend persists `error` (and up to the `DB_LOG_LEVEL`) logs into the `logs` table. This is enabled by the custom DB transport in `backend/logger.js`.
- File-based logs were removed from the default config; old log files are deleted at startup. If you prefer file logs or rotation, add a file transport or use `winston-daily-rotate-file`.

---

## Optional developer conveniences

- Run the DB initializer again (safe & idempotent): `node init_db.js`
- Run the backend on a different port: `$env:PORT=5001; npm start`
- If you want a test endpoint to verify DB-based error logging quickly, I can add a `/api/debug/error` route that throws an error (ask for `add-debug-endpoint`).

---

## Security & sharing

- Do not commit `.env` to version control. Provide a `.env.example` instead.
- Replace `JWT_SECRET` with a secure secret for non-development environments.
- If sharing the project, include this README or the shortened run steps.

---

If you want, I can also add a small PowerShell script to automate setup (install, init DB, start). Reply `add-ps1` and I'll add it.
Engineer Productivity & Attendance Tracker

This workspace contains two folders:

- `backend` — Node.js + Express API with SQLite (authentication, logging)
- `frontend` — React (Vite) UI with login/register components

Quick start

1. Backend

```powershell
cd "c:\Users\Sabari\Desktop\webindia\Time and Management\backend"
npm install
npm run init-db
npm start
```

2. Frontend (Create React App)

```powershell
cd "c:\Users\Sabari\Desktop\webindia\Time and Management\frontend"
npm install
npm start
```

Notes
- The backend uses a simple SQLite DB located at `backend/data/engineer_tracker.db`.
- Error logs are written to `backend/logs` via Winston.
- JWT secret is `JWT_SECRET` environment variable; default dev secret is used if not set.

- The backend now uses Postgres. Create a database and set connection values in `backend/.env` (see `.env.example`).
- Error logs are written to `backend/logs` via Winston.
- JWT secret is `JWT_SECRET` environment variable; set a secure value for production.

Next steps
- Implement CSV upload endpoints and data processing.
- Build reporting visualizations and file import UI.
- Add tests, input validation, and production configuration.
