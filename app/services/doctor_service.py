from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.appointment import Appointment
from app.models.department import Department
from app.models.medical_record import MedicalRecord
from app.models.doctor import Doctor
from app.models.user import User, UserRole
from app.schemas.doctor import DoctorCreate, DoctorOut, DoctorUpdate


def _to_output(doctor: Doctor) -> DoctorOut:
    return DoctorOut(
        id=doctor.id,
        name=doctor.user.name,
        email=doctor.user.email,
        phone=doctor.phone,
        specialization=doctor.specialization,
        department_id=doctor.department_id,
        department=doctor.department,
    )


def get_all(db: Session, hospital_id: int) -> list[DoctorOut]:
    doctors = (
        db.query(Doctor)
        .filter(Doctor.hospital_id == hospital_id)
        .all()
    )

    return [_to_output(doctor) for doctor in doctors]


def get_by_id(
    db: Session,
    doctor_id: int,
    hospital_id: int,
) -> DoctorOut:
    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == doctor_id,
            Doctor.hospital_id == hospital_id,
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    return _to_output(doctor)


def create(
    db: Session,
    data: DoctorCreate,
    hospital_id: int,
) -> DoctorOut:
    existing_user = (
        db.query(User)
        .filter(
            User.hospital_id == hospital_id,
            User.email == data.email,
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered for this hospital",
        )

    if data.department_id is not None:
        department = (
            db.query(Department)
            .filter(
                Department.id == data.department_id,
                Department.hospital_id == hospital_id,
            )
            .first()
        )

        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found in this hospital",
            )

    user = User(
        hospital_id=hospital_id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=UserRole.doctor,
    )

    db.add(user)
    db.flush()

    doctor = Doctor(
        hospital_id=hospital_id,
        user_id=user.id,
        phone=data.phone,
        specialization=data.specialization,
        department_id=data.department_id,
    )

    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return _to_output(doctor)


def update(
    db: Session,
    doctor_id: int,
    data: DoctorUpdate,
    hospital_id: int,
) -> DoctorOut:
    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == doctor_id,
            Doctor.hospital_id == hospital_id,
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    values = data.model_dump(exclude_unset=True)

    if "name" in values:
        doctor.user.name = values.pop("name")

    if "email" in values:
        existing_user = (
            db.query(User)
            .filter(
                User.hospital_id == hospital_id,
                User.email == values["email"],
                User.id != doctor.user_id,
            )
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered for this hospital",
            )

        doctor.user.email = values.pop("email")

    if "department_id" in values and values["department_id"] is not None:
        department = (
            db.query(Department)
            .filter(
                Department.id == values["department_id"],
                Department.hospital_id == hospital_id,
            )
            .first()
        )

        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found in this hospital",
            )

    for field, value in values.items():
        setattr(doctor, field, value)

    db.commit()
    db.refresh(doctor)

    return _to_output(doctor)


def delete(
    db: Session,
    doctor_id: int,
    hospital_id: int,
) -> dict:
    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == doctor_id,
            Doctor.hospital_id == hospital_id,
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    appointment_count = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == doctor_id,
            Appointment.hospital_id == hospital_id,
        )
        .count()
    )

    record_count = (
        db.query(MedicalRecord)
        .filter(
            MedicalRecord.doctor_id == doctor_id,
            MedicalRecord.hospital_id == hospital_id,
        )
        .count()
    )

    if appointment_count > 0 or record_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete doctor while appointments or medical records are associated with this doctor",
        )

    user = doctor.user

    db.delete(doctor)
    db.flush()

    db.delete(user)
    db.commit()

    return {"message": "Doctor deleted successfully"}
