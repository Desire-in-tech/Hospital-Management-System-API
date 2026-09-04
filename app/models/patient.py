import enum

from sqlalchemy import Column, Date, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    hospital_id = Column(
        Integer,
        ForeignKey("hospitals.id"),
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    dob = Column(Date, nullable=True)
    gender = Column(Enum(Gender), nullable=True)
    address = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)

    hospital = relationship("Hospital", back_populates="patients")

    user = relationship(
        "User",
        back_populates="patient_profile",
    )

    appointments = relationship(
        "Appointment",
        back_populates="patient",
    )

    medical_records = relationship(
        "MedicalRecord",
        back_populates="patient",
    )
