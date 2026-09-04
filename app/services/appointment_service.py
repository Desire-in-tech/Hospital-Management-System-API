from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentOut, AppointmentUpdate


def _to_output(appointment: Appointment) -> AppointmentOut:
    return AppointmentOut.model_validate(appointment)


def get_all(
    db: Session,
    current_user_id: int,
    hospital_id: int,
    role: UserRole,
    patient_id: int | None = None,
) -> list[AppointmentOut]:
    query = db.query(Appointment).filter(
        Appointment.hospital_id == hospital_id
    )

    if role == UserRole.patient:
        patient = (
            db.query(Patient)
            .filter(
                Patient.user_id == current_user_id,
                Patient.hospital_id == hospital_id,
            )
            .first()
        )

        if not patient:
            return []

        query = query.filter(Appointment.patient_id == patient.id)

    elif role == UserRole.doctor:
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.user_id == current_user_id,
                Doctor.hospital_id == hospital_id,
            )
            .first()
        )

        if not doctor:
            return []

        query = query.filter(Appointment.doctor_id == doctor.id)

    elif patient_id is not None:
        patient = (
            db.query(Patient)
            .filter(
                Patient.id == patient_id,
                Patient.hospital_id == hospital_id,
            )
            .first()
        )

        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )

        query = query.filter(Appointment.patient_id == patient_id)

    return [_to_output(appointment) for appointment in query.all()]


def get_by_id(
    db: Session,
    appt_id: int,
    hospital_id: int,
) -> Appointment:
    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == appt_id,
            Appointment.hospital_id == hospital_id,
        )
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    return appointment


def _validate_future_date(appointment_date: datetime) -> None:
    if appointment_date <= datetime.now(appointment_date.tzinfo):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment must be scheduled for a future date and time",
        )


def _check_conflicts(
    db: Session,
    hospital_id: int,
    doctor_id: int,
    patient_id: int,
    appointment_date: datetime,
    exclude_appointment_id: int | None = None,
) -> None:
    query = db.query(Appointment).filter(
        Appointment.hospital_id == hospital_id,
        Appointment.appointment_date == appointment_date,
        Appointment.status.notin_(
            [
                AppointmentStatus.completed,
                AppointmentStatus.cancelled,
            ]
        ),
    )

    if exclude_appointment_id is not None:
        query = query.filter(Appointment.id != exclude_appointment_id)

    doctor_conflict = query.filter(
        Appointment.doctor_id == doctor_id
    ).first()

    if doctor_conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor already has an appointment at this time",
        )

    patient_conflict = query.filter(
        Appointment.patient_id == patient_id
    ).first()

    if patient_conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient already has an appointment at this time",
        )


def create(
    db: Session,
    data: AppointmentCreate,
    patient_id: int,
    hospital_id: int,
) -> AppointmentOut:
    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id,
            Patient.hospital_id == hospital_id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == data.doctor_id,
            Doctor.hospital_id == hospital_id,
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    _validate_future_date(data.appointment_date)

    _check_conflicts(
        db=db,
        hospital_id=hospital_id,
        doctor_id=data.doctor_id,
        patient_id=patient_id,
        appointment_date=data.appointment_date,
    )

    appointment = Appointment(
        hospital_id=hospital_id,
        patient_id=patient_id,
        doctor_id=data.doctor_id,
        appointment_date=data.appointment_date,
        reason=data.reason,
        status=AppointmentStatus.pending,
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return _to_output(appointment)


def update_status(
    db: Session,
    appt_id: int,
    data: AppointmentUpdate,
    hospital_id: int,
) -> AppointmentOut:
    appointment = get_by_id(
        db,
        appt_id,
        hospital_id,
    )

    updates = data.model_dump(exclude_unset=True)

    # Completed and cancelled appointments are terminal.
    if appointment.status in (
        AppointmentStatus.completed,
        AppointmentStatus.cancelled,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot modify a {appointment.status.value} appointment",
        )

    new_status = updates.get("status")
    new_date = updates.get("appointment_date")

    # Validate status transitions.
    if new_status is not None:
        allowed_transitions = {
            AppointmentStatus.pending: {
                AppointmentStatus.confirmed,
                AppointmentStatus.cancelled,
            },
            AppointmentStatus.confirmed: {
                AppointmentStatus.completed,
                AppointmentStatus.cancelled,
            },
        }

        allowed = allowed_transitions.get(appointment.status, set())

        if new_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid status transition: "
                    f"{appointment.status.value} -> {new_status.value}"
                ),
            )

    # Rescheduling rules.
    if new_date is not None:
        _validate_future_date(new_date)

        _check_conflicts(
            db=db,
            hospital_id=hospital_id,
            doctor_id=appointment.doctor_id,
            patient_id=appointment.patient_id,
            appointment_date=new_date,
            exclude_appointment_id=appointment.id,
        )

    for field, value in updates.items():
        setattr(appointment, field, value)

    db.commit()
    db.refresh(appointment)

    return _to_output(appointment)


def delete(
    db: Session,
    appt_id: int,
    hospital_id: int,
) -> dict:
    appointment = get_by_id(
        db,
        appt_id,
        hospital_id,
    )

    db.delete(appointment)
    db.commit()

    return {"message": "Appointment deleted successfully"}
