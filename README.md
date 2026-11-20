# HarbourStrikeX

**A controlled enterprise security validation platform for Crimeathon 2026**

HarbourStrikeX is an end-to-end hackathon project that combines a realistic web dashboard, a Docker-backed FastAPI/PostgreSQL environment, and a Go offensive-validation CLI. It recreates the evidence chain of Case **CR-26-047** and lets reviewers trace a simulated supply-chain intrusion from initial API reconnaissance through bank-account tampering and orphaned-account authentication.

> **Educational use only:** Run this project on your own laptop or isolated Docker network. The repository is designed to demonstrate security weaknesses and detection opportunities, not to target real organizations or systems.

---

## At a Glance

| Component | Technology | Default address |
|---|---|---|
| Frontend investigation dashboard | React 19, TypeScript, Vite, Tailwind CSS | `http://localhost:5173` |
| Backend API | Python 3.12, FastAPI, SQLAlchemy | `http://localhost:8000` |
| API documentation | Swagger / OpenAPI | `http://localhost:8000/docs` |
| PostgreSQL | PostgreSQL 16 in Docker | `localhost:5433` |
| Offensive validation CLI | Go, Cobra | `hso.exe` / `hso` |

---

## What the Project Demonstrates

HarbourStrikeX is more than a mock presentation. The three application layers share the same seeded PostgreSQL state and expose an auditable scenario:

- **Phase 1 - Reconnaissance:** Inspect machine-key identity and API scope in LedgerOne.
- **Phase 2 - Support harvesting:** Create and inspect HelpDeskr export jobs.
- **Phase 3 - Storage exfiltration:** Enumerate and read BlueVault documents with a leaked storage key.
- **Phase 4 - Vendor exfiltration:** Export the LedgerOne vendor catalog.
- **Phase 5 - Private-link pivot:** Correlate V-0412 payments with TallyBridge network-flow evidence.
- **Phase 6 - Bank tampering:** Demonstrate approval-free modification of vendor bank details.
- **Phase 7 - Payout verification:** Confirm a scheduled payment and its live bank destination.
- **Phase 8 - Orphaned account:** Test the remaining authentication weakness for the terminated `r.menon` account.

The CLI reports HTTP status and real API responses rather than silently substituting fake success data. It can also replay an offline demo, while Docker-backed live mode is the default.

---

## Repository Structure

```text
HarbourStrikeX/
├── frontend/                 # React investigation dashboard
│   ├── src/services/api.ts   # Centralized FastAPI client
│   └── src/components/       # Case views and user interface
├── backend/                  # Dockerized FastAPI + PostgreSQL
│   ├── api/                  # Authentication, dashboard, LedgerOne,
│   │                         # HelpDeskr, BlueVault, TallyBridge routes
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic request and response schemas
│   ├── schema.sql            # Deterministic case evidence seed data
│   └── docker-compose.yml    # Backend and PostgreSQL containers
├── attack-cli/               # Go attack-validation CLI
│   ├── cmd/                  # Cobra commands
│   └── pkg/client/           # FastAPI HTTP integration
└── project_context/          # Case evidence and narrative source material
```

---

## Prerequisites

Install the following before running the project:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose
- [Node.js 20+](https://nodejs.org/) and npm
- [Go 1.24+](https://go.dev/dl/) for the CLI
- [Python 3.12+](https://www.python.org/) and [`uv`](https://docs.astral.sh/uv/) for optional host-based backend development

Verify the core tools:

```powershell
docker --version
docker compose version
node --version
npm --version
go version
```

---

## Quick Start: Run the Full Project

Open **three PowerShell terminals** in the repository root.

### Terminal 1 - Start the backend and database

```powershell
cd backend
docker compose up -d --build
```

Wait for both containers to become healthy, then verify the API:

```powershell
curl.exe http://localhost:8000/health
curl.exe http://localhost:8000/docs
```

The first command should return:

```json
{"status":"healthy"}
```

Swagger UI is available at `http://localhost:8000/docs`.

### Terminal 2 - Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The frontend uses `http://localhost:8000` by default. To use another backend address:

```powershell
# Create frontend/.env.local
VITE_API_BASE_URL=http://localhost:8000
```

The frontend must be restarted after changing this file.

### Terminal 3 - Build and run the CLI

```powershell
cd attack-cli
go test ./...
.\build.ps1
.\dist\hso.exe status
```

The build script runs the tests and produces `attack-cli/dist/hso.exe`.

To build manually:

```powershell
cd attack-cli
go build -o dist\hso.exe .
.\dist\hso.exe status
```

On Linux or macOS, replace `hso.exe` with `hso`.

---

## Demo Login

Open `http://localhost:5173` and use one of the seeded accounts:

| Role | Username | Password |
|---|---|---|
| IT administrator | `a.kapoor` | `admin123` |
| Finance | `m.sundar` | `user123` |
| Finance | `f.dsouza` | `user123` |
| Support | `s.iyer` | `user123` |
| Orphaned account | `r.menon` | `user123` |

Credentials are seeded only for this local hackathon environment.

---

## CLI Demonstration

Live mode is the default and connects to `http://localhost:8000`.

Run the eight case phases individually:

```powershell
cd attack-cli

# Phase 1 - LedgerOne machine-key reconnaissance
.\dist\hso.exe recon

# Phase 2 - HelpDeskr export and ticket harvesting
.\dist\hso.exe harvest

# Phase 3 - BlueVault document enumeration and read
.\dist\hso.exe storage

# Phase 4 - Vendor master export
.\dist\hso.exe vendor-exfil

# Phase 5 - Private-link and scheduled-payment profiling
.\dist\hso.exe pivot

# Phase 6 - Vendor bank-account tampering
.\dist\hso.exe tamper --vendor V-0412 --account HDFC0001842-9083

# Phase 7 - Scheduled payout verification
.\dist\hso.exe verify-run

# Phase 8 - Terminated-orphaned account authentication
.\dist\hso.exe auth-test --user r.menon --device dev-81546
```

Useful campaign commands:

```powershell
# Run the complete eight-phase campaign
.\dist\hso.exe campaign run --all

# Run selected live phases
.\dist\hso.exe campaign run --phases 1,6

# Offline presentation replay
.\dist\hso.exe recon --mode simulate

# Case evidence and report commands
.\dist\hso.exe evidence list
.\dist\hso.exe evidence inspect E18
.\dist\hso.exe evidence time-convert "2026-09-03 01:44:30"
.\dist\hso.exe report --format markdown --output findings.md
.\dist\hso.exe report --format json --output findings.json
```

Override the target or execution settings:

```powershell
.\dist\hso.exe recon --target-url http://localhost:8000 --api-key key-tb-07 --mode live
```

Run `hso.exe --help` or `hso.exe <command> --help` for all options.

---

## Backend API Highlights

| Area | Representative routes |
|---|---|
| Health | `GET /health`, `GET /` |
| Authentication | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` |
| LedgerOne | `GET /api/v2/me`, `GET /api/v2/schema`, `GET /api/v2/vendors/export` |
| Bank change | `GET/PATCH /api/v2/vendors/{vendor_id}/bank-details` |
| Payments | `GET /api/v2/payments/scheduled`, `GET /api/v2/payments/search?vendor_id=V-0412` |
| HelpDeskr | `GET/POST /api/v1/support/tickets`, `GET/POST /api/v1/support/exports` |
| BlueVault | `GET /api/storage/list`, `GET /api/storage/read` |
| TallyBridge | `GET /api/integration/network-flows` |
| Dashboard | `GET /api/dashboard/status`, `/stats`, `/activity` |

Swagger UI is the canonical interactive API reference: `http://localhost:8000/docs`.

---

## Database Access

PostgreSQL is mapped to host port **5433** so it does not conflict with a local PostgreSQL server on 5432.

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `5433` |
| Database | `harbourstrikex` |
| Username | `hsuser` |
| Password | `hspassword` |

Connect through pgAdmin, DBeaver, VS Code extensions, or `psql`:

```powershell
docker exec -it harbourstrikex-db psql -U hsuser -d harbourstrikex
```

Useful reset commands:

```powershell
# Stop containers while preserving database state
docker compose -f backend/docker-compose.yml down

# Reset the database to the original case evidence seed
docker compose -f backend/docker-compose.yml down -v
docker compose -f backend/docker-compose.yml up -d --build
```

Using `down -v` deletes the Docker volume and restores the seed data on the next startup.

---

## Testing and Validation

Run all relevant checks from the repository root:

### Backend

```powershell
cd backend
uv sync
uv run pytest -v
```

### Frontend

```powershell
cd frontend
npm install
npm run build
npm run lint
```

### CLI

```powershell
cd attack-cli
go test ./...
.\build.ps1
```

Suggested reviewer verification:

1. Start Docker and confirm `GET /health` returns `healthy`.
2. Open the frontend and sign in with `a.kapoor` / `admin123`.
3. Open Swagger UI and inspect the seeded LedgerOne and HelpDeskr routes.
4. Run `hso.exe recon`, `hso.exe tamper`, and `hso.exe verify-run`.
5. Use the campaign to demonstrate the complete execution path.

---

## Local Backend Development Without Docker for the API

The database can remain in Docker while FastAPI runs directly on the host:

```powershell
cd backend
docker compose up -d db
uv sync
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API container is not required in this mode. Stop Docker services with:

```powershell
docker compose down
```

---

## Production-Build Preview

To build and preview the frontend locally:

```powershell
cd frontend
npm run build
npm run preview
```

The preview server normally uses `http://localhost:4173`.

---

## Troubleshooting

### Docker backend is unavailable

```powershell
cd backend
docker compose ps
docker compose logs -f backend
docker compose logs -f db
```

Rebuild if dependencies or source files changed:

```powershell
docker compose up -d --build
```

### Frontend cannot reach FastAPI

- Confirm the backend is at `http://localhost:8000`.
- Confirm `VITE_API_BASE_URL` is set correctly in `frontend/.env.local`.
- Restart `npm run dev` after changing the environment file.
- Open `http://localhost:8000/docs` to verify CORS and API availability.

### Database data is stale or already changed

Reset the Docker volume:

```powershell
cd backend
docker compose down -v
docker compose up -d --build
```

### CLI reports an HTTP error

- Keep Docker running.
- Verify `/health` at `http://localhost:8000`.
- Use `--target-url http://localhost:8000`.
- Run with `--mode live` to avoid offline replay.
- Check that the CLI binary was rebuilt after source changes.

---

## Scope and Safety

HarbourStrikeX intentionally models insecure authentication, authorization, and approval behavior for forensic education. The backend is intended for an isolated local Docker environment and should not be deployed to the public internet without:

- Removing or restricting demonstration credentials
- Replacing case-specific acceptance gaps with appropriate security controls
- Using secrets through an external secret manager
- Limiting CORS and network exposure
- Adding audit, rate limiting, MFA, dual approval, and key rotation
- Replacing seed accounts and evidence with a securely managed test dataset

---

## Submission Information

**Project:** HarbourStrikeX  
**Hackathon:** Crimeathon 2026  
**Case:** CR-26-047 — Harbor & Finch Freight Pvt. Ltd.  
**Team:** Guns and Roses

The project combines a polished forensic dashboard, a reproducible Docker backend, realistic evidence data, and a live Go validation engine so reviewers can assess both the presentation and the underlying behavior.
