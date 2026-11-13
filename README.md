# TBP Dataset Commons

> **The Builder Protocol** · Open dataset discovery and sharing for the AI/ML community

TBP Dataset Commons is a full-stack web platform for submitting, reviewing, and discovering high-quality open datasets. Contributors submit datasets with rich metadata; administrators review and approve; developers and researchers discover and cite.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Client                     │
│               React 18 · TypeScript · Vite                  │
│        TanStack Query · React Router · Tailwind CSS         │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP / REST  (via nginx proxy /api)
┌──────────────────────▼──────────────────────────────────────┐
│                       nginx (port 3000)                     │
│          Serves SPA static files + reverse-proxies          │
│               /api  ──►  backend:8000                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   FastAPI Backend (port 8000)               │
│      Python 3.11 · SQLAlchemy 2.0 async · Alembic          │
│    JWT Auth · Pydantic v2 · Uvicorn · asyncpg              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               PostgreSQL 16 (port 5432)                     │
│       users · datasets · collections · issue_reports        │
│                   · activity_logs                           │
└─────────────────────────────────────────────────────────────┘

Optional (dev profile):
  pgAdmin 4 (port 5050)  ──►  PostgreSQL
```

---

## Tech Stack

| Layer      | Technology                                               |
|------------|----------------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query |
| Backend    | Python 3.11, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 |
| Auth       | JWT (python-jose), bcrypt (passlib)                      |
| Database   | PostgreSQL 16                                            |
| Migrations | Alembic                                                  |
| Container  | Docker, Docker Compose                                   |
| CI         | GitHub Actions                                           |
| Web server | nginx (SPA + API proxy)                                  |

---

## Project Structure

```
data.thebuilderprotocol.me/
├── backend/
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial.py
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── config.py
│       ├── database.py
│       ├── models/          # SQLAlchemy ORM models
│       ├── schemas/         # Pydantic v2 request/response schemas
│       ├── routers/         # FastAPI route handlers
│       ├── services/        # Business logic layer
│       ├── middleware/      # Rate limiting etc.
│       └── utils/           # Citation helpers, file validation
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── api/             # Typed API client functions
│       ├── components/      # Shared UI components
│       ├── pages/           # Route-level page components
│       ├── hooks/           # Custom React hooks
│       ├── store/           # Zustand auth store
│       ├── types/           # TypeScript interfaces
│       └── utils/           # Helpers (formatting, citation)
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── README.md
├── CONTRIBUTING.md
└── LICENCE
```

---

## Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended) — or
- **Python 3.11+** and **Node 20+** and **PostgreSQL 16** installed locally

---

### Option A — Docker Compose (recommended)

```bash
# 1. Clone the repo
git clone https://github.com/thebuilderprotocol/data.thebuilderprotocol.me.git
cd data.thebuilderprotocol.me

# 2. Copy and edit the root environment file
cp backend/.env.example .env
# Edit .env — set SECRET_KEY, DATABASE_URL, etc.

# 3. Start all services
docker compose up --build

# Frontend → http://localhost:3000
# Backend API → http://localhost:8000/docs
# pgAdmin (dev) → http://localhost:5050
```

To start with the **dev profile** (includes pgAdmin):

```bash
docker compose --profile dev up --build
```

To seed sample data after the containers are up:

```bash
docker compose exec backend python -m app.seed
```

---

### Option B — Local development

#### 1. Database

```bash
# Start Postgres (or use a cloud instance)
docker run -d \
  --name tbp-postgres \
  -e POSTGRES_USER=tbp \
  -e POSTGRES_PASSWORD=tbp \
  -e POSTGRES_DB=tbp_datasets \
  -p 5432:5432 \
  postgres:16-alpine
```

#### 2. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your local values

# Run database migrations
alembic upgrade head

# (Optional) Seed sample data
python -m app.seed

# Start the development server (auto-reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: <http://localhost:8000/docs>

#### 3. Frontend

```bash
cd frontend

# Install dependencies (pnpm preferred)
pnpm install          # or: npm install

# Configure environment
cp .env.example .env

# Start the dev server
pnpm dev              # or: npm run dev
```

Frontend: <http://localhost:5173>

---

## Environment Variables

Copy `backend/.env.example` to `.env` (project root for Docker, or `backend/.env` for local).

| Variable            | Description                                   | Default / Example                             |
|---------------------|-----------------------------------------------|-----------------------------------------------|
| `DATABASE_URL`      | Async PostgreSQL connection string            | `postgresql+asyncpg://tbp:tbp@localhost/tbp_datasets` |
| `DATABASE_USER`     | Postgres username (used by Docker Compose)    | `tbp`                                         |
| `DATABASE_PASSWORD` | Postgres password                             | *(set a strong value)*                        |
| `DATABASE_DB`       | Postgres database name                        | `tbp_datasets`                                |
| `SECRET_KEY`        | JWT signing secret — keep this secret         | *(generate with `openssl rand -hex 32`)*      |
| `ALGORITHM`         | JWT algorithm                                 | `HS256`                                       |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT access token lifetime           | `30`                                          |
| `CORS_ORIGINS`      | Comma-separated allowed origins               | `http://localhost:5173,http://localhost:3000` |
| `ENVIRONMENT`       | `development` or `production`                 | `development`                                 |

Frontend variables live in `frontend/.env`:

| Variable       | Description              | Default  |
|----------------|--------------------------|----------|
| `VITE_API_URL` | Base URL for API calls   | `/api`   |

---

## Running with Seed Data

```bash
# Docker
docker compose exec backend python -m app.seed

# Local
cd backend && python -m app.seed
```

The seed script creates:
- One admin account (`admin@thebuilderprotocol.me`)
- Five sample contributor accounts
- Ten sample approved datasets (with realistic metadata)
- Two curated collections

---

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contributor guide, including:

- How to submit a dataset
- The review process
- How to contribute code
- Community guidelines and Code of Conduct

---

## Licence

This project is released under the **MIT Licence** — see [LICENCE](./LICENCE) for the full text.

---

<sub>Built with ❤️ by The Builder Protocol</sub>
