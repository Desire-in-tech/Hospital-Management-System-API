from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.medical_record import MedicalRecord
from app.models.user import UserRole
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordOut


def get_all(db: Session, current_user_id: int, role: UserRole) -> list[MedicalRecordOut]:
    query = db.query(MedicalRecord)

    if role == UserRole.patient:
        from app.models.patient import Patient
        from app.models.user import User
        user = db.query(User).filter(User.id == current_user_id).first()
        patient = db.query(Patient).filter(Patient.email == user.email).first() if user else None
        if patient:
            query = query.filter(MedicalRecord.patient_id == patient.id)
        else:
            return []
    elif role == UserRole.doctor:
        from app.models.doctor import Doctor
        from app.models.user import User
        user = db.query(User).filter(User.id == current_user_id).first()
        doctor = db.query(Doctor).filter(Doctor.email == user.email).first() if user else None
        if doctor:
            query = query.filter(MedicalRecord.doctor_id == doctor.id)
        else:
            return []

    return [MedicalRecordOut.model_validate(r) for r in query.all()]


def get_by_id(db: Session, record_id: int) -> MedicalRecordOut:
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found")
    return MedicalRecordOut.model_validate(record)


def create(db: Session, data: MedicalRecordCreate, doctor_id: int) -> MedicalRecordOut:
    record = MedicalRecord(
        patient_id=data.patient_id,
        doctor_id=doctor_id,
        diagnosis=data.diagnosis,
        notes=data.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return MedicalRecordOut.model_validate(record)


def delete(db: Session, record_id: int) -> dict:
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found")
    db.delete(record)
    db.commit()
    return {"message": "Medical record deleted successfully"}
