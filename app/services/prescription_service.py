from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.medical_record import MedicalRecord
from app.models.prescription import Prescription
from app.schemas.prescription import PrescriptionCreate, PrescriptionOut


def get_all(db: Session, record_id: int | None = None) -> list[PrescriptionOut]:
    query = db.query(Prescription)
    if record_id:
        query = query.filter(Prescription.medical_record_id == record_id)
    return [PrescriptionOut.model_validate(p) for p in query.all()]


def get_by_id(db: Session, prescription_id: int) -> PrescriptionOut:
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    return PrescriptionOut.model_validate(prescription)


def create(db: Session, data: PrescriptionCreate) -> PrescriptionOut:
    record = db.query(MedicalRecord).filter(MedicalRecord.id == data.medical_record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found")
    prescription = Prescription(**data.model_dump())
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return PrescriptionOut.model_validate(prescription)


def delete(db: Session, prescription_id: int) -> dict:
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    db.delete(prescription)
    db.commit()
    return {"message": "Prescription deleted successfully"}
