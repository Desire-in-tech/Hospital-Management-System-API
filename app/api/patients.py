from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User, UserRole
from app.schemas.patient import PatientCreate, PatientOut, PatientUpdate
from app.services import patient_service


router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/", response_model=list[PatientOut])
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.patient:
        patient = patient_service.get_by_user_id(
            db,
            current_user.id,
            current_user.hospital_id,
        )

        if not patient:
            return []

        return [patient_service._to_output(patient)]

    return patient_service.get_all(
        db,
        current_user.hospital_id,
    )


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = (
        patient_service.get_by_id(
            db,
            patient_id,
            current_user.hospital_id,
        )
    )

    if current_user.role == UserRole.patient:
        own = patient_service.get_by_user_id(
            db,
            current_user.id,
            current_user.hospital_id,
        )

        if not own or own.id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    return patient


@router.post("/", response_model=PatientOut, status_code=201)
def create_patient(
    data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return patient_service.create(
        db,
        data,
        current_user.hospital_id,
    )


@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: int,
    data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = patient_service.get_by_id(
        db,
        patient_id,
        current_user.hospital_id,
    )

    if current_user.role == UserRole.patient:
        own = patient_service.get_by_user_id(
            db,
            current_user.id,
            current_user.hospital_id,
        )

        if not own or own.id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    return patient_service.update(
        db,
        patient_id,
        data,
        current_user.hospital_id,
    )


@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return patient_service.delete(
        db,
        patient_id,
        current_user.hospital_id,
    )
