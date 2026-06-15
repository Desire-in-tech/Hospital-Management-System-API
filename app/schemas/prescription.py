from pydantic import BaseModel


class PrescriptionCreate(BaseModel):
    medical_record_id: int
    medicine_name: str
    dosage: str
    duration: str


class PrescriptionOut(BaseModel):
    id: int
    medical_record_id: int
    medicine_name: str
    dosage: str
    duration: str

    model_config = {"from_attributes": True}
