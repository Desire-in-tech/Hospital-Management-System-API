from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.schemas.doctor import DoctorCreate, DoctorOut, DoctorUpdate
from app.services import doctor_service

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("/", response_model=list[DoctorOut])
def list_doctors(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return doctor_service.get_all(db)


@router.get("/{doctor_id}", response_model=DoctorOut)
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return doctor_service.get_by_id(db, doctor_id)


@router.post("/", response_model=DoctorOut, status_code=201)
def create_doctor(
    data: DoctorCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return doctor_service.create(db, data)


@router.put("/{doctor_id}", response_model=DoctorOut)
def update_doctor(
    doctor_id: int,
    data: DoctorUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return doctor_service.update(db, doctor_id, data)


@router.delete("/{doctor_id}")
def delete_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return doctor_service.delete(db, doctor_id)
