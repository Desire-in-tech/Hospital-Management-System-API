from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models.patient import Gender


class PatientCreate(BaseModel):
    name: str
    email: EmailStr
    dob: Optional[date] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    phone: Optional[str] = None


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    dob: Optional[date] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    phone: Optional[str] = None


class PatientOut(BaseModel):
    id: int
    name: str
    email: str
    dob: Optional[date]
    gender: Optional[Gender]
    address: Optional[str]
    phone: Optional[str]

    model_config = {"from_attributes": True}
