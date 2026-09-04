import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(
        Integer,
        ForeignKey("hospitals.id"),
        nullable=False,
        index=True,
    )
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, index=True)
    appointment_date = Column(DateTime, nullable=False)
    status = Column(
        Enum(AppointmentStatus),
        default=AppointmentStatus.pending,
        nullable=False,
    )
    reason = Column(String(500), nullable=True)

    hospital = relationship("Hospital")
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
