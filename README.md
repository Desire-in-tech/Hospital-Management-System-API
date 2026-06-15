# Hospital Management System API

A production-style REST API for managing hospital operations — built with FastAPI, PostgreSQL, SQLAlchemy, Alembic, and JWT authentication.

---

## Tech Stack

- **FastAPI** — high-performance web framework
- **PostgreSQL** — relational database
- **SQLAlchemy** — ORM
- **Alembic** — database migrations
- **JWT** — authentication via `python-jose`
- **bcrypt** — password hashing via `passlib`
- **Faker** — seed data generation
- **Docker + Docker Compose** — containerization

---

## Quickstart (Docker)

```bash
# 1. Clone the repo and enter the folder
cd "Hospital Management System API"

# 2. Copy the env file
cp .env.example .env
# Edit .env and set a strong SECRET_KEY

# 3. Start everything
docker compose up --build

# 4. API is available at:
#    http://localhost:8000
#    http://localhost:8000/docs  (Swagger UI)
```

---

## Seed the Database

```bash
# In a second terminal, after docker compose up:
docker compose exec api python -m scripts.seed
```

Default credentials after seeding:
| Role    | Email                     | Password      |
|---------|---------------------------|---------------|
| Admin   | admin@hospital.com        | Admin@1234    |
| Doctor  | (any seeded doctor email) | Doctor@1234   |
| Patient | (any seeded patient email)| Patient@1234  |

---

## Run Migrations

Migrations run automatically on `docker compose up`.  
To run manually:

```bash
docker compose exec api alembic upgrade head
```

To generate a new migration after model changes:

```bash
docker compose exec api alembic revision --autogenerate -m "describe your change"
docker compose exec api alembic upgrade head
```

---

## API Endpoints

### Authentication
| Method | Path            | Description       |
|--------|-----------------|-------------------|
| POST   | /auth/register  | Register new user |
| POST   | /auth/login     | Login (returns JWT)|

### Departments (Admin: full CRUD, Others: read-only)
| Method | Path                    |
|--------|-------------------------|
| GET    | /departments/           |
| GET    | /departments/{id}       |
| POST   | /departments/           |
| PUT    | /departments/{id}       |
| DELETE | /departments/{id}       |

### Doctors (Admin: full CRUD, Others: read-only)
| Method | Path               |
|--------|--------------------|
| GET    | /doctors/          |
| GET    | /doctors/{id}      |
| POST   | /doctors/          |
| PUT    | /doctors/{id}      |
| DELETE | /doctors/{id}      |

### Patients (Admin: full CRUD, Patient: own record only)
| Method | Path                |
|--------|---------------------|
| GET    | /patients/          |
| GET    | /patients/{id}      |
| POST   | /patients/          |
| PUT    | /patients/{id}      |
| DELETE | /patients/{id}      |

### Appointments
| Method | Path                       | Notes                        |
|--------|----------------------------|------------------------------|
| GET    | /appointments/             | Role-filtered                |
| GET    | /appointments/{id}         |                              |
| POST   | /appointments/             | Patients book for themselves |
| POST   | /appointments/admin        | Admin books for any patient  |
| PUT    | /appointments/{id}         | Doctors/Admin update status  |
| DELETE | /appointments/{id}         | Admin only                   |

### Medical Records
| Method | Path              | Notes                     |
|--------|-------------------|---------------------------|
| GET    | /records/         | Role-filtered             |
| GET    | /records/{id}     |                           |
| POST   | /records/         | Doctors create            |
| POST   | /records/admin    | Admin creates with doctor |
| DELETE | /records/{id}     | Admin only                |

### Prescriptions
| Method | Path                    | Notes           |
|--------|-------------------------|-----------------|
| GET    | /prescriptions/         | Filter by record|
| GET    | /prescriptions/{id}     |                 |
| POST   | /prescriptions/         | Doctors create  |
| DELETE | /prescriptions/{id}     | Admin only      |

---

## Role-Based Access

| Feature                        | Admin | Doctor | Patient |
|--------------------------------|-------|--------|---------|
| Manage departments             | ✅    | ❌     | ❌      |
| Manage doctors                 | ✅    | ❌     | ❌      |
| View all patients              | ✅    | ✅     | ❌      |
| View own patient record        | ✅    | ✅     | ✅      |
| Book appointments              | ✅    | ❌     | ✅      |
| Confirm/cancel appointments    | ✅    | ✅     | ❌      |
| Create medical records         | ✅    | ✅     | ❌      |
| View own medical records       | ✅    | ✅     | ✅      |
| Create prescriptions           | ✅    | ✅     | ❌      |

---

## Railway Deployment

1. Push this folder to a GitHub repository.
2. Create a new Railway project → "Deploy from GitHub Repo".
3. Add a PostgreSQL service in Railway and copy the `DATABASE_URL`.
4. Set environment variables in Railway:
   - `DATABASE_URL` — from Railway Postgres
   - `SECRET_KEY` — a long random string
   - `ALGORITHM` — `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` — `30`
5. Railway will detect the `Dockerfile` and deploy automatically.
6. After first deploy, run the seed script via Railway's shell tab.

---

## Local Development (without Docker)

```bash
# Install dependencies
pip install -r requirements.txt

# Set env vars in .env with a local DATABASE_URL

# Run migrations
alembic upgrade head

# Seed data
python -m scripts.seed

# Start server
uvicorn app.main:app --reload --port 8000
```

---

## Running Tests

Tests use an in-memory SQLite database — no running PostgreSQL or Docker required.

```bash
# Install test dependencies
pip install -r requirements-test.txt

# Run all tests (from inside the Hospital Management System API folder)
pytest

# Run with coverage report
pytest --cov=app --cov-report=term-missing

# Run a specific test file
pytest tests/test_auth.py
pytest tests/test_departments.py
pytest tests/test_patients.py
pytest tests/test_doctors.py
pytest tests/test_health.py
```

### Test Coverage

| File                        | What it tests                                              |
|-----------------------------|------------------------------------------------------------|
| `tests/test_health.py`      | Root `/`, `/health`, `/docs`, auth guards on all routes   |
| `tests/test_auth.py`        | Register, login, token format, duplicate email, OAuth2    |
| `tests/test_departments.py` | Full CRUD + role-based write access (admin-only)          |
| `tests/test_doctors.py`     | Full CRUD + role guards, department linking               |
| `tests/test_patients.py`    | Full CRUD + patients can only see/edit their own record   |
