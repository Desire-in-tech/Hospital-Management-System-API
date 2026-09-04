from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.database import Base


class Department(Base):
    __tablename__ = "departments"

    __table_args__ = (
        UniqueConstraint(
            "hospital_id",
            "name",
            name="uq_departments_hospital_name",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)

    hospital = relationship("Hospital", back_populates="departments")
    doctors = relationship("Doctor", back_populates="department")
