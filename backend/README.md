# HarbourStrikeX FastAPI Backend

Simulation backend for Harbor & Finch Freight Pvt. Ltd. (Case CR-26-047).

## Tech Stack
- Python 3.12+ / FastAPI / SQLAlchemy (async)
- PostgreSQL 16 (Docker)
- `uv` for package management
- Docker Compose for multi-container orchestration (API + PostgreSQL + pgAdmin)

---

## Running with Docker Compose (Recommended)

To start the entire stack (FastAPI Backend + PostgreSQL + pgAdmin) in one command:

```powershell
cd backend
docker compose up -d --build
```

### Running Services:
| Service | URL / Port | Credentials / Notes |
|---|---|---|
| **FastAPI Backend** | `http://localhost:8000` | Swagger UI at `http://localhost:8000/docs` |
| **PostgreSQL Database** | `localhost:5433` | User: `hsuser`, Password: `hspassword`, DB: `harbourstrikex` |
| **pgAdmin (Web UI)** | `http://localhost:5050` | Email: `admin@harbourstrike.com`, Password: `admin` |

To stop the containers:
```powershell
docker compose down
```

---

## How to Connect to the Database in DBeaver & pgAdmin

> [!NOTE]
> The database is mapped to host port **`5433`** (to avoid conflicts with any default PostgreSQL instance running on port 5432).

### Connection Parameters:
- **Host**: `localhost` (or `127.0.0.1`)
- **Port**: `5433`
- **Database**: `harbourstrikex`
- **Username**: `hsuser`
- **Password**: `hspassword`

---

### Option 1: DBeaver (Desktop)

1. Open DBeaver.
2. Click **Database** -> **New Database Connection** (or click the plug icon in the toolbar).
3. Select **PostgreSQL** and click **Next**.
4. In the **Connection Settings** window, enter:
   - **Host**: `localhost`
   - **Port**: `5433`
   - **Database**: `harbourstrikex`
   - **Username**: `hsuser`
   - **Password**: `hspassword`
5. Click **Test Connection** (DBeaver will prompt to download the PostgreSQL JDBC driver if it is your first time).
6. Click **Finish**.
7. In the Database Navigator tree:
   - Expand `harbourstrikex` -> `Databases` -> `harbourstrikex` -> `Schemas` -> `public` -> `Tables`.
   - You will see all 15 tables (`vendors`, `bank_detail_changes`, `ledger_api_logs`, `tickets`, `export_jobs`, `storage_keys`, `api_keys`, etc.).

---

### Option 2: pgAdmin (Desktop)

1. Open desktop pgAdmin 4.
2. In the left browser tree, right-click **Servers** -> **Register** -> **Server...**.
3. In the **General** tab:
   - **Name**: `HarbourStrikeX Local`
4. In the **Connection** tab:
   - **Host name/address**: `localhost`
   - **Port**: `5433`
   - **Maintenance database**: `harbourstrikex`
   - **Username**: `hsuser`
   - **Password**: `hspassword`
   - *(Optional)* Check **Save password**.
5. Click **Save**.
6. Expand `HarbourStrikeX Local` -> `Databases` -> `harbourstrikex` -> `Schemas` -> `public` -> `Tables`.

---

### Option 3: pgAdmin 4 Web (Included in Docker Compose)

If you don't have DBeaver or desktop pgAdmin installed, a pre-configured web version of pgAdmin is already running in the Docker stack!

1. Open your browser and navigate to: **`http://localhost:5050`**
2. Log in with:
   - **Email**: `admin@harbourstrike.com`
   - **Password**: `admin`
3. In the left sidebar under **Servers**, **`HarbourStrikeX DB`** is already pre-configured:
   - Click to expand it.
   - Enter password: `hspassword`.
   - Browse to `Databases` -> `harbourstrikex` -> `Schemas` -> `public` -> `Tables`!

---

## Local Development (Outside Docker)

If you want to run the FastAPI app directly on your host machine while keeping Postgres in Docker:

```powershell
cd backend
docker compose up -d db
uv sync
uv run uvicorn main:app --reload --port 8000
```

Run tests:
```powershell
uv run pytest -v
```
