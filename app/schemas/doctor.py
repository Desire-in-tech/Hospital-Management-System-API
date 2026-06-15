from typing import Optional

from pydantic import BaseModel, EmailStr

from app.schemas.department import DepartmentOut


class DoctorCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    specialization: Optional[str] = None
    department_id: Optional[int] = None


class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    department_id: Optional[int] = None


class DoctorOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    specialization: Optional[str]
    department_id: Optional[int]
    department: Optional[DepartmentOut] = None

    model_config = {"from_attributes": True}
