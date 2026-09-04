from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.schemas.patient import PatientCreate, PatientOut, PatientUpdate


def _to_output(patient: Patient) -> PatientOut:
    return PatientOut(
        id=patient.id,
        name=patient.user.name,
        email=patient.user.email,
        dob=patient.dob,
        gender=patient.gender,
        address=patient.address,
        phone=patient.phone,
    )


def get_all(db: Session, hospital_id: int) -> list[PatientOut]:
    patients = (
        db.query(Patient)
        .filter(Patient.hospital_id == hospital_id)
        .all()
    )

    return [_to_output(patient) for patient in patients]


def get_by_id(
    db: Session,
    patient_id: int,
    hospital_id: int,
) -> PatientOut:
    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id,
            Patient.hospital_id == hospital_id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return _to_output(patient)


def get_by_user_id(
    db: Session,
    user_id: int,
    hospital_id: int,
) -> Patient | None:
    return (
        db.query(Patient)
        .filter(
            Patient.user_id == user_id,
            Patient.hospital_id == hospital_id,
        )
        .first()
    )


def create(
    db: Session,
    data: PatientCreate,
    hospital_id: int,
) -> PatientOut:
    existing_user = (
        db.query(User)
        .filter(
            User.hospital_id == hospital_id,
            User.email == data.email,
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered for this hospital",
        )

    user = User(
        hospital_id=hospital_id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=UserRole.patient,
    )

    db.add(user)
    db.flush()

    patient = Patient(
        hospital_id=hospital_id,
        user_id=user.id,
        dob=data.dob,
        gender=data.gender,
        address=data.address,
        phone=data.phone,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return _to_output(patient)


def update(
    db: Session,
    patient_id: int,
    data: PatientUpdate,
    hospital_id: int,
) -> PatientOut:
    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id,
            Patient.hospital_id == hospital_id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    values = data.model_dump(exclude_unset=True)

    if "name" in values:
        patient.user.name = values.pop("name")

    if "email" in values:
        existing_user = (
            db.query(User)
            .filter(
                User.hospital_id == hospital_id,
                User.email == values["email"],
                User.id != patient.user_id,
            )
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered for this hospital",
            )

        patient.user.email = values.pop("email")

    for field, value in values.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)

    return _to_output(patient)


def delete(
    db: Session,
    patient_id: int,
    hospital_id: int,
) -> dict:
    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id,
            Patient.hospital_id == hospital_id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    appointment_count = (
        db.query(Appointment)
        .filter(
            Appointment.patient_id == patient_id,
            Appointment.hospital_id == hospital_id,
        )
        .count()
    )

    record_count = (
        db.query(MedicalRecord)
        .filter(
            MedicalRecord.patient_id == patient_id,
            MedicalRecord.hospital_id == hospital_id,
        )
        .count()
    )

    if appointment_count > 0 or record_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete patient while appointments or medical records are associated with this patient",
        )

    user = patient.user

    db.delete(patient)
    db.flush()

    db.delete(user)
    db.commit()

    return {"message": "Patient deleted successfully"}
