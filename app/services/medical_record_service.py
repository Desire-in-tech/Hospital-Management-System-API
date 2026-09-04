from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.doctor import Doctor
from app.models.medical_record import MedicalRecord
from app.models.patient import Patient
from app.models.user import UserRole
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordOut


def get_all(
    db: Session,
    current_user_id: int,
    hospital_id: int,
    role: UserRole,
) -> list[MedicalRecordOut]:
    query = db.query(MedicalRecord).filter(
        MedicalRecord.hospital_id == hospital_id
    )

    if role == UserRole.patient:
        patient = (
            db.query(Patient)
            .filter(
                Patient.user_id == current_user_id,
                Patient.hospital_id == hospital_id,
            )
            .first()
        )

        if not patient:
            return []

        query = query.filter(
            MedicalRecord.patient_id == patient.id
        )

    elif role == UserRole.doctor:
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.user_id == current_user_id,
                Doctor.hospital_id == hospital_id,
            )
            .first()
        )

        if not doctor:
            return []

        query = query.filter(
            MedicalRecord.doctor_id == doctor.id
        )

    return [
        MedicalRecordOut.model_validate(record)
        for record in query.all()
    ]


def get_by_id(
    db: Session,
    record_id: int,
    hospital_id: int,
) -> MedicalRecord:
    record = (
        db.query(MedicalRecord)
        .filter(
            MedicalRecord.id == record_id,
            MedicalRecord.hospital_id == hospital_id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found",
        )

    return record


def create(
    db: Session,
    data: MedicalRecordCreate,
    doctor_id: int,
    hospital_id: int,
) -> MedicalRecordOut:
    patient = (
        db.query(Patient)
        .filter(
            Patient.id == data.patient_id,
            Patient.hospital_id == hospital_id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == doctor_id,
            Doctor.hospital_id == hospital_id,
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    record = MedicalRecord(
        hospital_id=hospital_id,
        patient_id=patient.id,
        doctor_id=doctor.id,
        diagnosis=data.diagnosis,
        notes=data.notes,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return MedicalRecordOut.model_validate(record)


def delete(
    db: Session,
    record_id: int,
    hospital_id: int,
) -> dict:
    record = get_by_id(
        db,
        record_id,
        hospital_id,
    )

    db.delete(record)
    db.commit()

    return {"message": "Medical record deleted successfully"}
