from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User, UserRole
from app.schemas.prescription import PrescriptionCreate, PrescriptionOut
from app.services import prescription_service

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.get("/", response_model=list[PrescriptionOut])
def list_prescriptions(
    record_id: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return prescription_service.get_all(db, record_id)


@router.get("/{prescription_id}", response_model=PrescriptionOut)
def get_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return prescription_service.get_by_id(db, prescription_id)


@router.post("/", response_model=PrescriptionOut, status_code=201)
def create_prescription(
    data: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.doctor, UserRole.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can create prescriptions")
    return prescription_service.create(db, data)


@router.delete("/{prescription_id}")
def delete_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return prescription_service.delete(db, prescription_id)
