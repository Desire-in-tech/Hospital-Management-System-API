from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.prescription import PrescriptionOut


class MedicalRecordCreate(BaseModel):
    patient_id: int
    diagnosis: str
    notes: Optional[str] = None


class MedicalRecordOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    diagnosis: str
    notes: Optional[str]
    created_at: Optional[datetime]
    prescriptions: list[PrescriptionOut] = []

    model_config = {"from_attributes": True}
