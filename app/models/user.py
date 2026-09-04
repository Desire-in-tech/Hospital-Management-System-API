import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    doctor = "doctor"
    patient = "patient"


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        UniqueConstraint("hospital_id", "email", name="uq_users_hospital_email"),
    )

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.patient)

    hospital = relationship("Hospital", back_populates="users")
    doctor_profile = relationship(
        "Doctor",
        back_populates="user",
        uselist=False,
    )
    patient_profile = relationship(
        "Patient",
        back_populates="user",
        uselist=False,
    )
