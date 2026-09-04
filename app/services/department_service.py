from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.doctor import Doctor
from app.schemas.department import DepartmentCreate, DepartmentOut, DepartmentUpdate


def get_all(db: Session, hospital_id: int) -> list[DepartmentOut]:
    departments = (
        db.query(Department)
        .filter(Department.hospital_id == hospital_id)
        .all()
    )

    return [DepartmentOut.model_validate(dept) for dept in departments]


def get_by_id(
    db: Session,
    dept_id: int,
    hospital_id: int,
) -> DepartmentOut:
    dept = (
        db.query(Department)
        .filter(
            Department.id == dept_id,
            Department.hospital_id == hospital_id,
        )
        .first()
    )

    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    return DepartmentOut.model_validate(dept)


def create(
    db: Session,
    data: DepartmentCreate,
    hospital_id: int,
) -> DepartmentOut:
    existing = (
        db.query(Department)
        .filter(
            Department.hospital_id == hospital_id,
            Department.name == data.name,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department already exists in this hospital",
        )

    dept = Department(
        hospital_id=hospital_id,
        name=data.name,
    )

    db.add(dept)
    db.commit()
    db.refresh(dept)

    return DepartmentOut.model_validate(dept)


def update(
    db: Session,
    dept_id: int,
    data: DepartmentUpdate,
    hospital_id: int,
) -> DepartmentOut:
    dept = (
        db.query(Department)
        .filter(
            Department.id == dept_id,
            Department.hospital_id == hospital_id,
        )
        .first()
    )

    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    if data.name is not None:
        existing = (
            db.query(Department)
            .filter(
                Department.hospital_id == hospital_id,
                Department.name == data.name,
                Department.id != dept_id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department already exists in this hospital",
            )

        dept.name = data.name

    db.commit()
    db.refresh(dept)

    return DepartmentOut.model_validate(dept)


def delete(
    db: Session,
    dept_id: int,
    hospital_id: int,
) -> dict:
    dept = (
        db.query(Department)
        .filter(
            Department.id == dept_id,
            Department.hospital_id == hospital_id,
        )
        .first()
    )

    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    assigned_doctors = (
        db.query(Doctor)
        .filter(
            Doctor.department_id == dept_id,
            Doctor.hospital_id == hospital_id,
        )
        .count()
    )

    if assigned_doctors > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete department while doctors are assigned to it",
        )

    db.delete(dept)
    db.commit()

    return {"message": "Department deleted successfully"}
