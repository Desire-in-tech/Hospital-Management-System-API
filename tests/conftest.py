"""
Shared fixtures for all tests.

Uses an in-memory SQLite database so the test suite does not require
PostgreSQL/Supabase.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.db.database import Base, get_db
from app.main import app
from app.models.hospital import Hospital
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.models.doctor import Doctor


SQLITE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture(scope="function", autouse=True)
def setup_database():
    """Create all tables before each test and drop them afterwards."""
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


def create_hospital(db, name, slug):
    hospital = Hospital(
        name=name,
        slug=slug,
    )
    db.add(hospital)
    db.flush()
    return hospital


def create_user(
    db,
    hospital,
    name,
    email,
    password,
    role,
):
    user = User(
        hospital_id=hospital.id,
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    db.flush()
    return user


def make_token(user):
    return create_access_token(
        {
            "sub": str(user.id),
            "hospital_id": user.hospital_id,
            "role": user.role.value,
        }
    )


@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def hospital_a(db):
    return create_hospital(
        db,
        "Hospital A",
        "hospital-a",
    )


@pytest.fixture
def hospital_b(db):
    return create_hospital(
        db,
        "Hospital B",
        "hospital-b",
    )


@pytest.fixture
def admin_user(db, hospital_a):
    user = create_user(
        db,
        hospital_a,
        "Test Admin",
        "admin@hospital-a.test",
        "Admin@1234",
        UserRole.admin,
    )
    db.commit()
    return user


@pytest.fixture
def admin_token(admin_user):
    return make_token(admin_user)


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def doctor_user(db, hospital_a):
    user = create_user(
        db,
        hospital_a,
        "Test Doctor",
        "doctor@hospital-a.test",
        "Doctor@1234",
        UserRole.doctor,
    )

    doctor = Doctor(
        hospital_id=hospital_a.id,
        user_id=user.id,
        phone="555-0101",
        specialization="General Medicine",
    )

    db.add(doctor)
    db.commit()

    return user


@pytest.fixture
def second_doctor_user(db, hospital_a):
    user = create_user(
        db,
        hospital_a,
        "Second Test Doctor",
        "doctor2@hospital-a.test",
        "Doctor2@1234",
        UserRole.doctor,
    )

    doctor = Doctor(
        hospital_id=hospital_a.id,
        user_id=user.id,
        phone="555-0102",
        specialization="Cardiology",
    )

    db.add(doctor)
    db.commit()

    return user


@pytest.fixture
def doctor_token(doctor_user):
    return make_token(doctor_user)


@pytest.fixture
def doctor_headers(doctor_token):
    return {"Authorization": f"Bearer {doctor_token}"}


@pytest.fixture
def patient_user(db, hospital_a):
    user = create_user(
        db,
        hospital_a,
        "Test Patient",
        "patient@hospital-a.test",
        "Patient@1234",
        UserRole.patient,
    )

    patient = Patient(
        hospital_id=hospital_a.id,
        user_id=user.id,
    )

    db.add(patient)
    db.commit()

    return user


@pytest.fixture
def patient_token(patient_user):
    return make_token(patient_user)


@pytest.fixture
def patient_headers(patient_token):
    return {"Authorization": f"Bearer {patient_token}"}


@pytest.fixture
def hospital_b_admin(db, hospital_b):
    user = create_user(
        db,
        hospital_b,
        "Hospital B Admin",
        "admin@hospital-b.test",
        "AdminB@1234",
        UserRole.admin,
    )
    db.commit()
    return user


@pytest.fixture
def hospital_b_admin_token(hospital_b_admin):
    return make_token(hospital_b_admin)


@pytest.fixture
def hospital_b_admin_headers(hospital_b_admin_token):
    return {"Authorization": f"Bearer {hospital_b_admin_token}"}
