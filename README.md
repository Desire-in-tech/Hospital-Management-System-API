# CareFlow — Hospital Management System

A full-stack hospital management platform designed to help healthcare organizations manage patients, doctors, departments, appointments, medical records, and prescriptions through a secure role-based workspace.

CareFlow started as a FastAPI hospital-management API and was extended into a complete SaaS-style application with a Next.js frontend, PostgreSQL persistence through Supabase, JWT authentication, role-based access control, and cloud deployment.

## Live Application

**Frontend:**  
https://careflowfrontend-nvcv2hx1b-desire9.vercel.app/

**Backend API:**  
https://hospital-management-system-api-eik1.onrender.com

The frontend is deployed on Vercel, the FastAPI backend is deployed on Render, and the application database is hosted on Supabase PostgreSQL.

---

## Overview

CareFlow provides a centralized digital workspace for hospital staff and patients.

The application supports three primary roles:

- **Admin** — manages hospital operations and resources.
- **Doctor** — manages appointments, patients, medical records, and prescriptions within their authorized scope.
- **Patient** — views their healthcare information and books appointments.

The application uses one shared dashboard architecture that adapts navigation and available actions according to the authenticated user's role.

---

## Key Features

### Authentication & Authorization

- Hospital registration
- Hospital-specific login using a hospital slug
- JWT-based authentication
- Role-based access control
- Admin, Doctor, and Patient roles
- Protected API endpoints
- Hospital-scoped data access
- Token expiration handling
- Automatic redirect for unauthenticated dashboard access

### Hospital Administration

Administrators can manage:

- Doctors
- Patients
- Departments
- Appointments
- Medical records
- Prescriptions

### Doctor Workflow

Doctors can:

- View their appointments
- Confirm appointments
- Complete appointments
- View patients within their hospital
- Create medical records
- Create prescriptions associated with medical records
- Access authorized records and prescriptions

### Patient Workflow

Patients can:

- View their own patient information
- Update their own patient profile
- View their appointments
- Book appointments
- View their medical records
- View prescriptions associated with their records

Patients cannot modify appointment status or delete appointments.

---

## Appointment Management

Appointments support a controlled lifecycle:

    pending
       |
       +----> confirmed
       |          |
       |          +----> completed
       |          |
       |          +----> cancelled
       |
       +----> cancelled

The backend validates:

- Future appointment dates
- Appointment ownership
- Doctor ownership
- Hospital scope
- Role permissions
- Valid status transitions
- Terminal states for completed/cancelled appointments
- Appointment modification permissions

Administrators can create appointments on behalf of patients and reschedule existing appointments.

### Appointment Rules

| Action | Admin | Doctor | Patient |
|---|---:|---:|---:|
| View authorized appointments | Yes | Yes | Yes |
| Create appointment | Yes | No | Yes |
| Update appointment | Yes | Own appointments | No |
| Confirm appointment | Yes | Own appointments | No |
| Complete appointment | Yes | Own appointments | No |
| Reschedule | Yes | Yes, where authorized | No |
| Delete appointment | Yes | No | No |

Completed appointments cannot be modified.

---

## Medical Records

Medical records contain:

- Patient
- Doctor
- Diagnosis
- Clinical notes
- Creation timestamp
- Associated prescriptions

Doctors can create records for patients they are authorized to treat.

Administrators can create records on behalf of a selected doctor.

Medical records do not currently expose an update endpoint; the frontend therefore provides record creation and detail views rather than an unsupported edit workflow.

---

## Prescriptions

Prescriptions are associated with medical records and contain:

- Medicine name
- Dosage
- Duration

Prescription access is restricted according to the authenticated user's role and hospital.

Doctors and administrators can create prescriptions.

Only administrators can delete prescriptions.

Prescriptions can also be filtered by medical record:

    GET /prescriptions/?record_id={record_id}

---

## Technology Stack

### Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Next.js App Router
- ESLint

### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- JWT authentication
- OAuth2-compatible token endpoint for Swagger
- Role-based authorization

### Database

- PostgreSQL
- Supabase

### Deployment

- Vercel — frontend
- Render — backend API
- Supabase — PostgreSQL database

---

## Architecture

    User
    Admin / Doctor / Patient
             |
             v
    +----------------------+
    |   Next.js Frontend   |
    |        Vercel        |
    +----------+-----------+
               |
          HTTPS / JSON
               |
               v
    +----------------------+
    |     FastAPI API      |
    |        Render        |
    +----------------------+
    | Authentication       |
    | RBAC                 |
    | Business Rules       |
    | API Routes           |
    | Service Layer        |
    +----------+-----------+
               |
          SQLAlchemy
               |
               v
    +----------------------+
    | PostgreSQL Database  |
    |       Supabase       |
    +----------------------+

The frontend communicates with the backend through authenticated HTTP requests.

Sensitive backend configuration and database credentials remain server-side. The frontend only exposes the public API base URL.

---

## Project Structure

    Hospital-Management-System-API/
    |
    +-- app/
    |   +-- api/
    |   |   +-- appointments.py
    |   |   +-- auth.py
    |   |   +-- departments.py
    |   |   +-- doctors.py
    |   |   +-- patients.py
    |   |   +-- prescriptions.py
    |   |   +-- records.py
    |   |
    |   +-- core/
    |   |   +-- config.py
    |   |
    |   +-- db/
    |   |   +-- database.py
    |   |
    |   +-- dependencies/
    |   |   +-- auth.py
    |   |
    |   +-- models/
    |   +-- schemas/
    |   +-- services/
    |   |
    |   +-- main.py
    |
    +-- frontend/
    |   +-- app/
    |   |   +-- dashboard/
    |   |   |   +-- appointments/
    |   |   |   +-- departments/
    |   |   |   +-- doctors/
    |   |   |   +-- medical-records/
    |   |   |   +-- patients/
    |   |   |   +-- prescriptions/
    |   |   |
    |   |   +-- login/
    |   |   +-- register/
    |   |
    |   +-- components/
    |   |   +-- dashboard/
    |   |
    |   +-- lib/
    |       +-- api.ts
    |       +-- auth.ts
    |       +-- types.ts
    |
    +-- tests/
    +-- Dockerfile
    +-- requirements.txt
    +-- .env.example
    +-- alembic.ini
    +-- README.md

---

## Frontend Routes

### Public Routes

| Route | Purpose |
|---|---|
| `/` | CareFlow landing page |
| `/login` | User authentication |
| `/register` | Hospital registration |

### Dashboard Routes

| Route | Purpose |
|---|---|
| `/dashboard` | Role-aware overview |
| `/dashboard/appointments` | Appointment management |
| `/dashboard/appointments/new` | Create/book appointment |
| `/dashboard/appointments/[id]/edit` | Edit appointment |
| `/dashboard/patients` | Patient management |
| `/dashboard/patients/new` | Create patient |
| `/dashboard/patients/[id]/edit` | Edit patient |
| `/dashboard/doctors` | Doctor management |
| `/dashboard/doctors/new` | Create doctor |
| `/dashboard/doctors/[id]/edit` | Edit doctor |
| `/dashboard/departments` | Department management |
| `/dashboard/departments/new` | Create department |
| `/dashboard/departments/[id]/edit` | Edit department |
| `/dashboard/medical-records` | Medical records |
| `/dashboard/medical-records/new` | Create medical record |
| `/dashboard/medical-records/[id]` | Medical record details |
| `/dashboard/prescriptions` | Prescription management |
| `/dashboard/prescriptions/new` | Create prescription |

---

## API

### Authentication

    POST /auth/register
    POST /auth/login
    POST /auth/token

`/auth/login` is the JSON login endpoint used by the frontend.

`/auth/token` provides an OAuth2-compatible token endpoint for tools such as FastAPI Swagger UI.

### Doctors

    GET    /doctors/
    GET    /doctors/{doctor_id}
    POST   /doctors/
    PUT    /doctors/{doctor_id}
    DELETE /doctors/{doctor_id}

### Patients

    GET    /patients/
    GET    /patients/{patient_id}
    POST   /patients/
    PUT    /patients/{patient_id}
    DELETE /patients/{patient_id}

### Departments

    GET    /departments/
    GET    /departments/{department_id}
    POST   /departments/
    PUT    /departments/{department_id}
    DELETE /departments/{department_id}

### Appointments

    GET    /appointments/
    GET    /appointments/{appointment_id}
    POST   /appointments/
    POST   /appointments/admin
    PUT    /appointments/{appointment_id}
    DELETE /appointments/{appointment_id}

### Medical Records

    GET    /records/
    GET    /records/{record_id}
    POST   /records/
    POST   /records/admin
    DELETE /records/{record_id}

### Prescriptions

    GET    /prescriptions/
    GET    /prescriptions/{prescription_id}
    POST   /prescriptions/
    DELETE /prescriptions/{prescription_id}

Optional medical-record filtering:

    GET /prescriptions/?record_id={record_id}

---

## Role-Based Access Control

CareFlow uses backend-enforced role-based authorization.

### Admin

Administrators can:

- Manage doctors
- Manage patients
- Manage departments
- Create appointments for patients
- Update appointments
- Delete appointments
- Create medical records for selected doctors
- Delete medical records
- Create prescriptions
- Delete prescriptions
- View hospital-wide authorized data

### Doctor

Doctors can:

- View their appointments
- Update their own appointments
- Confirm appointments
- Complete appointments
- View hospital patients
- Create medical records
- Create prescriptions for records assigned to them
- View authorized medical records and prescriptions

Doctors cannot:

- Delete appointments
- Delete prescriptions
- Manage departments
- Manage doctors
- Perform administrator-only operations

### Patient

Patients can:

- View their own patient information
- Update their own patient information
- View their appointments
- Book appointments
- View their medical records
- View their prescriptions

Patients cannot:

- Update appointment status
- Delete appointments
- Create medical records
- Create prescriptions
- Access another patient's data

Authorization is enforced by the backend rather than relying only on frontend navigation restrictions.

---

## Authentication Flow

CareFlow uses JWT access tokens.

    User
      |
      | hospital_slug + email + password
      v
    POST /auth/login
      |
      | validate credentials
      v
    JWT access token
      |
      v
    Next.js frontend
      |
      | Authorization: Bearer <token>
      v
    Protected API endpoints

The JWT contains:

- User ID
- Hospital ID
- User role
- Token expiration

The frontend uses the token to maintain the authenticated session and determine role-aware UI behavior.

Actual authorization remains enforced by the backend.

---

## Multi-Tenant Hospital Model

Authentication is hospital-aware.

Users authenticate using:

    hospital_slug
    email
    password

The resulting JWT includes the user's hospital ID.

Backend resources are scoped to the authenticated hospital where appropriate, providing the foundation for a multi-tenant SaaS architecture.

---

## Environment Variables

### Backend

Backend environment variables are kept server-side.

Example:

    ENVIRONMENT=production
    DATABASE_URL=<postgresql-connection-string>
    SECRET_KEY=<strong-secret>
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    CORS_ORIGINS=<allowed-frontend-origins>

Never expose or commit real values for:

- `DATABASE_URL`
- `SECRET_KEY`

### Frontend

The frontend requires:

    NEXT_PUBLIC_API_URL=https://hospital-management-system-api-eik1.onrender.com

Only the API base URL is exposed to the browser.

---

## Running Locally

### Backend

From the repository root:

    pip install -r requirements.txt

Configure the backend environment variables in `.env`.

Start FastAPI:

    uvicorn app.main:app --reload

The API will be available at:

    http://localhost:8000

FastAPI documentation:

    http://localhost:8000/docs

### Frontend

Move into the frontend:

    cd frontend

Install dependencies:

    npm install

Create `.env.local`:

    NEXT_PUBLIC_API_URL=http://localhost:8000

Start the development server:

    npm run dev

The frontend will be available at:

    http://localhost:3000

---

## Production Deployment

### Frontend — Vercel

The Next.js application is deployed from:

    frontend/

Vercel configuration:

    Framework: Next.js
    Root Directory: frontend

Production API configuration:

    NEXT_PUBLIC_API_URL=https://hospital-management-system-api-eik1.onrender.com

The project is connected to GitHub so future pushes can trigger deployments.

### Backend — Render

The FastAPI backend is deployed on Render:

    https://hospital-management-system-api-eik1.onrender.com

Backend secrets and database configuration remain in the Render environment.

### Database — Supabase

The application uses PostgreSQL hosted through Supabase.

The database connection is provided to the backend through the server-side `DATABASE_URL` environment variable.

---

## CORS

The backend is configured to allow trusted frontend origins.

Development origins include:

    http://localhost:3000
    http://127.0.0.1:3000

Production frontend:

    https://careflowfrontend-nvcv2hx1b-desire9.vercel.app

CORS is configured on the backend rather than exposing backend configuration to the frontend.

---

## Testing & Quality Assurance

### Frontend Build

The final frontend passed:

    npm run lint
    npm run build

The production Next.js build completed successfully with all application routes generated.

### Authentication QA

The deployed API was validated for:

- Hospital registration
- Admin login
- Doctor login
- Patient login
- JWT generation
- Protected endpoint access
- Role-based access control

### Appointment QA

The deployed appointment system was tested through a complete lifecycle.

Validated:

- Patient appointment creation
- Patient update rejection
- Doctor confirmation
- Doctor completion
- Completed appointment modification rejection
- Patient deletion rejection
- Doctor deletion rejection
- Admin appointment creation
- Admin confirmation
- Appointment rescheduling
- Past-date rejection
- Valid status transitions
- Terminal appointment protection
- Admin deletion
- Deleted-resource verification

The production appointment QA completed successfully.

### Prescription QA

The deployed prescription workflow was tested for:

- Admin prescription access
- Doctor prescription access
- Patient prescription access
- Doctor prescription creation
- Patient creation rejection
- Authorized patient access
- Authorized doctor access
- Admin access
- Patient deletion rejection
- Doctor deletion rejection
- Admin deletion
- Deleted-resource verification

The production prescription QA completed successfully.

### Test Data Cleanup

Temporary production QA data was removed after testing, including:

- Temporary appointments
- Temporary medical record
- Temporary prescription

---

## Security Considerations

### Backend Authorization

Frontend navigation is not treated as a security boundary.

The backend independently validates:

- Authentication
- User role
- Hospital scope
- Resource ownership
- Appointment ownership
- Doctor ownership
- Medical-record access
- Prescription access

### Secret Management

Database credentials and JWT signing secrets remain server-side.

The frontend does not receive:

    DATABASE_URL
    SECRET_KEY

### Token Expiration

JWT access tokens have a defined expiration period.

The frontend checks token validity before treating a session as authenticated.

### Hospital Isolation

Users authenticate against a hospital slug and receive a hospital ID in the JWT, establishing tenant-level isolation for hospital resources.

---

## Design & UX

CareFlow uses a healthcare-focused visual language built around:

- Forest green
- Light green
- White
- Light blue
- Restrained red for errors and destructive actions

The design intentionally avoids the stereotypical oversized medical cross and generic AI-dashboard aesthetic.

The interface emphasizes:

- Clinical professionalism
- Trust
- Calm
- Operational efficiency
- Readability
- Responsive layouts
- Role-specific workflows

---

## Current Scope

The current version focuses on the core hospital-management workflow:

    Hospital
       |
       +-- Users
       |     +-- Admin
       |     +-- Doctors
       |     +-- Patients
       |
       +-- Departments
       |
       +-- Appointments
       |
       +-- Medical Records
       |       |
       |       +-- Prescriptions
       |
       +-- Role-aware dashboards

The system focuses on core hospital operations rather than attempting to implement every possible healthcare feature.

---

## Future Improvements

Potential future development areas include:

- Hospital staff/user management interface
- More granular permissions
- Appointment calendar views
- Notifications and reminders
- Email/SMS appointment notifications
- Patient search and filtering
- Advanced reporting and analytics
- Audit logging
- Pagination for large datasets
- Improved observability and monitoring
- Automated end-to-end browser testing
- Automated CI/CD testing
- Password reset and account recovery
- Profile management
- File/document attachments for medical records
- Expanded multi-tenant administration
- Production-grade secret rotation and key management

These are future improvements rather than current functionality.

---

## Development Principles

1. Backend authorization is authoritative.
2. Hospital data should remain tenant-scoped.
3. Secrets belong on the server, not the frontend.
4. Existing backend functionality should be preserved where practical.
5. Business rules belong in the backend rather than being enforced only by UI behavior.
6. Frontend workflows should reflect actual backend contracts.
7. Production behavior should be validated against the deployed API.

---

## What This Project Demonstrates

CareFlow demonstrates practical experience with:

- Full-stack application development
- REST API development
- FastAPI
- Python
- SQLAlchemy
- PostgreSQL
- Supabase
- Next.js
- React
- TypeScript
- Tailwind CSS
- JWT authentication
- Role-based access control
- Multi-tenant SaaS architecture
- API integration
- Database-backed applications
- Production deployment
- Vercel
- Render
- CORS configuration
- API testing
- Production QA
- Responsive UI development
- Secure environment-variable management

---

## Project Status

**Status: Deployed MVP / Active Portfolio Project**

### Completed

- [x] FastAPI backend
- [x] PostgreSQL/Supabase persistence
- [x] Hospital registration
- [x] Authentication
- [x] JWT authorization
- [x] Admin role
- [x] Doctor role
- [x] Patient role
- [x] Department management
- [x] Doctor management
- [x] Patient management
- [x] Appointment management
- [x] Appointment lifecycle rules
- [x] Medical records
- [x] Prescriptions
- [x] Role-aware dashboard
- [x] Next.js frontend
- [x] Responsive UI
- [x] Production build validation
- [x] Production API QA
- [x] Vercel deployment
- [x] Render deployment
- [x] Supabase database
- [x] CORS configuration

---

## Author

**Desire-in-Tech**

Self-taught software engineer focused on backend engineering, full-stack development, machine learning, and practical production-oriented applications.

GitHub: https://github.com/Desire-in-Tech
