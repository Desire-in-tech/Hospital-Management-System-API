from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.user import UserRole
from app.schemas.patient import PatientCreate, PatientOut, PatientUpdate


def get_all(db: Session) -> list[PatientOut]:
    patients = db.query(Patient).all()
    return [PatientOut.model_validate(p) for p in patients]


def get_by_id(db: Session, patient_id: int) -> PatientOut:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return PatientOut.model_validate(patient)


def get_by_email(db: Session, email: str) -> Patient | None:
    return db.query(Patient).filter(Patient.email == email).first()


def create(db: Session, data: PatientCreate) -> PatientOut:
    existing = db.query(Patient).filter(Patient.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient email already exists")
    patient = Patient(**data.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return PatientOut.model_validate(patient)


def update(db: Session, patient_id: int, data: PatientUpdate) -> PatientOut:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return PatientOut.model_validate(patient)


def delete(db: Session, patient_id: int) -> dict:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted successfully"}
