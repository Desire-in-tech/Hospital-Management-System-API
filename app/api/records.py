from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_admin, require_doctor
from app.models.doctor import Doctor
from app.models.user import User, UserRole
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordOut
from app.services import medical_record_service

router = APIRouter(prefix="/records", tags=["Medical Records"])


@router.get("/", response_model=list[MedicalRecordOut])
def list_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return medical_record_service.get_all(db, current_user.id, current_user.role)


@router.get("/{record_id}", response_model=MedicalRecordOut)
def get_record(
    record_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return medical_record_service.get_by_id(db, record_id)


@router.post("/", response_model=MedicalRecordOut, status_code=201)
def create_record(
    data: MedicalRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.doctor, UserRole.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can create medical records")

    if current_user.role == UserRole.doctor:
        doctor = db.query(Doctor).filter(Doctor.email == current_user.email).first()
        if not doctor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found")
        doctor_id = doctor.id
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin must specify doctor_id via admin endpoint")

    return medical_record_service.create(db, data, doctor_id)


@router.post("/admin", response_model=MedicalRecordOut, status_code=201)
def create_record_admin(
    data: MedicalRecordCreate,
    doctor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return medical_record_service.create(db, data, doctor_id)


@router.delete("/{record_id}")
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return medical_record_service.delete(db, record_id)
