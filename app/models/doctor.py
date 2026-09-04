from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

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

    phone = Column(String(50), nullable=True)
    specialization = Column(String(255), nullable=True)

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True,
        index=True,
    )

    hospital = relationship("Hospital", back_populates="doctors")

    user = relationship(
        "User",
        back_populates="doctor_profile",
    )

    department = relationship(
        "Department",
        back_populates="doctors",
    )

    appointments = relationship(
        "Appointment",
        back_populates="doctor",
    )

    medical_records = relationship(
        "MedicalRecord",
        back_populates="doctor",
    )
