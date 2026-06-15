"""
Shared fixtures for all tests.
Uses an in-memory SQLite database so no PostgreSQL is needed.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app

SQLITE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_token(client):
    client.post("/auth/register", json={
        "name": "Test Admin",
        "email": "admin@test.com",
        "password": "Admin@1234",
        "role": "admin",
    })
    response = client.post("/auth/login", json={
        "email": "admin@test.com",
        "password": "Admin@1234",
    })
    return response.json()["access_token"]


@pytest.fixture
def doctor_token(client):
    client.post("/auth/register", json={
        "name": "Test Doctor",
        "email": "doctor@test.com",
        "password": "Doctor@1234",
        "role": "doctor",
    })
    response = client.post("/auth/login", json={
        "email": "doctor@test.com",
        "password": "Doctor@1234",
    })
    return response.json()["access_token"]


@pytest.fixture
def patient_token(client):
    client.post("/auth/register", json={
        "name": "Test Patient",
        "email": "patient@test.com",
        "password": "Patient@1234",
        "role": "patient",
    })
    response = client.post("/auth/login", json={
        "email": "patient@test.com",
        "password": "Patient@1234",
    })
    return response.json()["access_token"]


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def doctor_headers(doctor_token):
    return {"Authorization": f"Bearer {doctor_token}"}


@pytest.fixture
def patient_headers(patient_token):
    return {"Authorization": f"Bearer {patient_token}"}
