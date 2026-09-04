from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentOut, AppointmentUpdate
from app.services import appointment_service


router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("/", response_model=list[AppointmentOut])
def list_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return appointment_service.get_all(
        db,
        current_user.id,
        current_user.hospital_id,
        current_user.role,
    )


@router.get("/{appt_id}", response_model=AppointmentOut)
def get_appointment(
    appt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = appointment_service.get_by_id(
        db,
        appt_id,
        current_user.hospital_id,
    )

    if current_user.role == UserRole.patient:
        patient = (
            db.query(Patient)
            .filter(
                Patient.user_id == current_user.id,
                Patient.hospital_id == current_user.hospital_id,
            )
            .first()
        )

        if not patient or appointment.patient_id != patient.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    elif current_user.role == UserRole.doctor:
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.user_id == current_user.id,
                Doctor.hospital_id == current_user.hospital_id,
            )
            .first()
        )

        if not doctor or appointment.doctor_id != doctor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    return appointment


@router.post("/", response_model=AppointmentOut, status_code=201)
def book_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.patient:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can book appointments",
        )

    patient = (
        db.query(Patient)
        .filter(
            Patient.user_id == current_user.id,
            Patient.hospital_id == current_user.hospital_id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found. Ask an administrator to create your patient record.",
        )

    return appointment_service.create(
        db,
        data,
        patient.id,
        current_user.hospital_id,
    )


@router.post("/admin", response_model=AppointmentOut, status_code=201)
def book_appointment_admin(
    data: AppointmentCreate,
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return appointment_service.create(
        db,
        data,
        patient_id,
        current_user.hospital_id,
    )


@router.put("/{appt_id}", response_model=AppointmentOut)
def update_appointment(
    appt_id: int,
    data: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = appointment_service.get_by_id(
        db,
        appt_id,
        current_user.hospital_id,
    )

    if current_user.role == UserRole.patient:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patients cannot update appointments",
        )

    if current_user.role == UserRole.doctor:
        doctor = (
            db.query(Doctor)
            .filter(
                Doctor.user_id == current_user.id,
                Doctor.hospital_id == current_user.hospital_id,
            )
            .first()
        )

        if not doctor or appointment.doctor_id != doctor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Doctors can only update their own appointments",
            )

    return appointment_service.update_status(
        db,
        appt_id,
        data,
        current_user.hospital_id,
    )


@router.delete("/{appt_id}")
def delete_appointment(
    appt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return appointment_service.delete(
        db,
        appt_id,
        current_user.hospital_id,
    )
