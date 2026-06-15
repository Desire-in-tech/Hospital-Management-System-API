# Hospital Management System API

## 1. Project Title

**Hospital Management System API**  
A backend-only REST API for managing core hospital operations, including authentication, patient workflows, appointments, medical records, and prescriptions.

---

## 2. Overview

The **Hospital Management System API** is a production-style backend service built to support day-to-day hospital operations through a secure and structured REST API.

It is designed for key hospital roles such as:
- **Administrators** managing departments, doctors, and overall system access
- **Doctors** reviewing patient data, managing appointments, and creating medical records
- **Patients** accessing their own information and booking appointments

This project is **backend-only** and exposes API endpoints for authentication, operational workflows, and clinical record management. It is well-suited for portfolio use as a SaaS-style backend focused on clean architecture, role-based authorization, and realistic healthcare domain modeling.

---

## 3. Features

- **JWT Authentication** for secure login and protected API access
- **Role-Based Access Control** for **Admin**, **Doctor**, and **Patient** users
- **Patient Management** with role-aware access to profile data
- **Doctor Management** with department assignment support
- **Appointment System** for scheduling and status updates
- **Medical Records** for storing diagnosis and consultation notes
- **Prescriptions** linked to medical records
- **Seed Data Generation** using Faker for realistic development and demo data
- **Docker Support** for containerized local development and deployment

---

## 4. Tech Stack

- **FastAPI** - high-performance Python web framework for building REST APIs
- **PostgreSQL** - primary relational database
- **SQLAlchemy** - ORM for database modeling and persistence
- **Alembic** - database schema migrations
- **JWT Authentication** - token-based authentication and authorization
- **Pydantic / Pydantic Settings** - request validation and configuration management
- **Docker & Docker Compose** - containerized development environment
- **Faker** - realistic seed data generation
- **PyJWT** - JWT token encoding and decoding
- **bcrypt** - password hashing

---

## 5. System Architecture

The application follows a clean layered backend structure:

- **FastAPI Layer**  
  Handles HTTP requests, routing, request validation, response serialization, and OpenAPI documentation.

- **Service Layer**  
  Contains the core business logic for authentication, patients, doctors, departments, appointments, records, and prescriptions.

- **Database Layer**  
  Uses PostgreSQL as the primary persistent data store for operational and clinical data.

- **ORM Layer (SQLAlchemy)**  
  Maps Python models to relational database tables and manages relationships between domain entities.

- **Migration Layer (Alembic)**  
  Tracks and applies schema changes consistently across development and deployment environments.

This structure keeps routing, business logic, and persistence concerns separated, making the project easier to maintain and extend.

---

## 6. Database Schema

The API is built around the following core entities:

- **Users**  
  Stores authentication and authorization data such as name, email, password hash, and role (`admin`, `doctor`, `patient`).

- **Patients**  
  Stores patient profile information including demographic and contact details.

- **Doctors**  
  Stores doctor profile data including specialization, email, phone, and department assignment.

- **Departments**  
  Represents hospital departments such as Cardiology, Neurology, and Pediatrics.

- **Appointments**  
  Connects patients and doctors for scheduled consultations and tracks appointment status.

- **Medical Records**  
  Stores diagnosis and consultation notes for a patient, created by a doctor.

- **Prescriptions**  
  Stores medication details linked to a medical record.

### Relationships

- One **Department** can have many **Doctors**
- One **Patient** can have many **Appointments**
- One **Doctor** can have many **Appointments**
- One **Patient** can have many **Medical Records**
- One **Doctor** can create many **Medical Records**
- One **Medical Record** can have many **Prescriptions**

### Important Modeling Note

In this codebase, **authentication users** and **domain profiles** are stored separately:
- `users` handles login credentials and role information
- `patients` and `doctors` store business/domain data

Doctor and patient access is associated in the application layer by matching the authenticated user's email with the corresponding doctor or patient profile.

---

## 7. Setup Instructions

### Clone repo

```bash
git clone <your-repository-url>
cd Hospital-Management-System-API
```

### Create virtual environment

```bash
python -m venv .venv
source .venv/Scripts/activate
```

> On macOS/Linux, use `source .venv/bin/activate` instead.

### Install dependencies

```bash
pip install -r requirements.txt
```

### Setup .env file

```bash
cp .env.example .env
```

Update `.env` with your local configuration:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hospital_db
SECRET_KEY=change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Run migrations (Alembic)

```bash
alembic upgrade head
```

### Seed database

```bash
python -m scripts.seed
```

### Start server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- `http://localhost:8000`
- `http://localhost:8000/docs`

---

## 8. Environment Variables

The project uses the following environment variables:

- `DATABASE_URL` - database connection string for PostgreSQL
- `SECRET_KEY` - secret used to sign JWT access tokens
- `ALGORITHM` - JWT signing algorithm, e.g. `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` - token expiration time in minutes

### Example values

For local development:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hospital_db
SECRET_KEY=change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

For Docker Compose networking, the database host is typically `db`:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/hospital_db
SECRET_KEY=change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 9. Running with Docker

This project includes a `Dockerfile` and `docker-compose.yml` for containerized development.

### Build containers

```bash
docker compose build
```

### Start services

```bash
docker compose up
```

The API will be accessible at:
- `http://localhost:8000`
- `http://localhost:8000/docs`

### Notes

- The API container runs Alembic migrations automatically on startup
- The PostgreSQL database is started as a separate service in Docker Compose
- Ensure your `.env` file uses the Docker database host (`db`) when running in containers

---

## 10. Seeding the Database

The project includes a seed script powered by **Faker** to generate realistic sample data for development, demos, and portfolio presentation.

### Purpose of the seed script

It populates the database with linked records so the API can be explored immediately through Swagger UI or API clients without manual setup.

### Run the seed script locally

```bash
python -m scripts.seed
```

### Run the seed script with Docker

```bash
docker compose exec api python -m scripts.seed
```

### Seeded data includes

- 1 admin user
- 10 departments
- 30 doctors
- 500 patients
- 1000 appointments
- 500 medical records
- 1000 prescriptions

### Default seeded credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@hospital.com` | `Admin@1234` |
| Doctor | any seeded doctor email | `Doctor@1234` |
| Patient | any seeded patient email | `Patient@1234` |

---

## 11. API Endpoints Overview

The API is organized into the following resource groups:

- **Auth**  
  Registration, login, and token issuance for authenticated access

- **Patients**  
  Patient profile management and role-aware access to patient data

- **Doctors**  
  Doctor profile management and department assignment

- **Departments**  
  Department creation, retrieval, update, and deletion

- **Appointments**  
  Appointment booking, listing, retrieval, status updates, and admin-managed scheduling

- **Medical Records**  
  Doctor/admin-created clinical records with role-based visibility

- **Prescriptions**  
  Prescription creation and retrieval linked to medical records

Interactive API documentation is available via Swagger UI at:

```bash
http://localhost:8000/docs
```

---

## 12. Future Improvements

Potential next steps for expanding the platform include:

- **Payment integration** for billing or paid consultation workflows
- **Notifications system** for appointment and status updates
- **Advanced analytics dashboard** for operational and clinical insights
- **Email reminders** for appointments, prescriptions, and follow-up care

---

## 13. Author Section

Built as a portfolio-ready backend project to demonstrate API design, authentication, role-based access control, database modeling, containerized development, and production-style backend architecture with FastAPI.