from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.api import appointments, auth, departments, doctors, patients, prescriptions, records
from app.core.config import settings
from app.core.exceptions import unhandled_exception_handler

app = FastAPI(
    title="Hospital Management System API",
    description="A production-style REST API for managing hospital operations.",
    version="1.0.0",
)

app.add_exception_handler(Exception, unhandled_exception_handler)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"

        return response


app.add_middleware(SecurityHeadersMiddleware)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(records.router)
app.include_router(prescriptions.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Hospital Management System API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
