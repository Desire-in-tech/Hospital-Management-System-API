import enum

from sqlalchemy import Column, Date, Enum, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    dob = Column(Date, nullable=True)
    gender = Column(Enum(Gender), nullable=True)
    address = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)

    appointments = relationship("Appointment", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")
