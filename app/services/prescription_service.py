from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.doctor import Doctor
from app.models.medical_record import MedicalRecord
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.user import UserRole
from app.schemas.prescription import PrescriptionCreate, PrescriptionOut


def get_all(
    db: Session,
    current_user_id: int,
    hospital_id: int,
    role: UserRole,
    record_id: int | None = None,
) -> list[PrescriptionOut]:
    query = (
        db.query(Prescription)
        .join(
            MedicalRecord,
            Prescription.medical_record_id == MedicalRecord.id,
        )
        .filter(MedicalRecord.hospital_id == hospital_id)
    )

    if record_id is not None:
        query = query.filter(
            Prescription.medical_record_id == record_id
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
        PrescriptionOut.model_validate(prescription)
        for prescription in query.all()
    ]


def get_by_id(
    db: Session,
    prescription_id: int,
    current_user_id: int,
    hospital_id: int,
    role: UserRole,
) -> PrescriptionOut:
    prescription = (
        db.query(Prescription)
        .join(
            MedicalRecord,
            Prescription.medical_record_id == MedicalRecord.id,
        )
        .filter(
            Prescription.id == prescription_id,
            MedicalRecord.hospital_id == hospital_id,
        )
        .first()
    )

    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found",
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

        if not patient or prescription.medical_record.patient_id != patient.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
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

        if not doctor or prescription.medical_record.doctor_id != doctor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    return PrescriptionOut.model_validate(prescription)


def create(
    db: Session,
    data: PrescriptionCreate,
    current_user_id: int,
    hospital_id: int,
    role: UserRole,
) -> PrescriptionOut:
    record = (
        db.query(MedicalRecord)
        .filter(
            MedicalRecord.id == data.medical_record_id,
            MedicalRecord.hospital_id == hospital_id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found",
        )

    if role == UserRole.doctor:
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.user_id == current_user_id,
                Doctor.hospital_id == hospital_id,
            )
            .first()
        )

        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found",
            )

        if record.doctor_id != doctor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Doctors can only prescribe for their own medical records",
            )

    prescription = Prescription(
        medical_record_id=data.medical_record_id,
        medicine_name=data.medicine_name,
        dosage=data.dosage,
        duration=data.duration,
    )

    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    return PrescriptionOut.model_validate(prescription)


def delete(
    db: Session,
    prescription_id: int,
    hospital_id: int,
) -> dict:
    prescription = (
        db.query(Prescription)
        .join(
            MedicalRecord,
            Prescription.medical_record_id == MedicalRecord.id,
        )
        .filter(
            Prescription.id == prescription_id,
            MedicalRecord.hospital_id == hospital_id,
        )
        .first()
    )

    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found",
        )

    db.delete(prescription)
    db.commit()

    return {"message": "Prescription deleted successfully"}
