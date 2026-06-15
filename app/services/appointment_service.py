from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentOut, AppointmentUpdate


def get_all(db: Session, current_user_id: int, role: UserRole, patient_id: int | None = None) -> list[AppointmentOut]:
    query = db.query(Appointment)

    if role == UserRole.patient:
        from app.models.patient import Patient
        patient = db.query(Patient).filter(Patient.email == _get_email_by_user_id(db, current_user_id)).first()
        if patient:
            query = query.filter(Appointment.patient_id == patient.id)
        else:
            return []
    elif role == UserRole.doctor:
        from app.models.doctor import Doctor
        doctor = db.query(Doctor).filter(Doctor.email == _get_email_by_user_id(db, current_user_id)).first()
        if doctor:
            query = query.filter(Appointment.doctor_id == doctor.id)
        else:
            return []

    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)

    return [AppointmentOut.model_validate(a) for a in query.all()]


def get_by_id(db: Session, appt_id: int) -> AppointmentOut:
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return AppointmentOut.model_validate(appt)


def create(db: Session, data: AppointmentCreate, patient_id: int) -> AppointmentOut:
    appt = Appointment(
        patient_id=patient_id,
        doctor_id=data.doctor_id,
        appointment_date=data.appointment_date,
        reason=data.reason,
        status=AppointmentStatus.pending,
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return AppointmentOut.model_validate(appt)


def update_status(db: Session, appt_id: int, data: AppointmentUpdate) -> AppointmentOut:
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(appt, field, value)
    db.commit()
    db.refresh(appt)
    return AppointmentOut.model_validate(appt)


def delete(db: Session, appt_id: int) -> dict:
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    db.delete(appt)
    db.commit()
    return {"message": "Appointment deleted successfully"}


def _get_email_by_user_id(db: Session, user_id: int) -> str | None:
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    return user.email if user else None
