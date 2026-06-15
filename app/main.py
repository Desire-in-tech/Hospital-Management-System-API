from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import appointments, auth, departments, doctors, patients, prescriptions, records

app = FastAPI(
    title="Hospital Management System API",
    description="A production-style REST API for managing hospital operations.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
