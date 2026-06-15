from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentOut, DepartmentUpdate


def get_all(db: Session) -> list[DepartmentOut]:
    departments = db.query(Department).all()
    return [DepartmentOut.model_validate(d) for d in departments]


def get_by_id(db: Session, dept_id: int) -> DepartmentOut:
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return DepartmentOut.model_validate(dept)


def create(db: Session, data: DepartmentCreate) -> DepartmentOut:
    existing = db.query(Department).filter(Department.name == data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department already exists")
    dept = Department(name=data.name)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return DepartmentOut.model_validate(dept)


def update(db: Session, dept_id: int, data: DepartmentUpdate) -> DepartmentOut:
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    if data.name is not None:
        dept.name = data.name
    db.commit()
    db.refresh(dept)
    return DepartmentOut.model_validate(dept)


def delete(db: Session, dept_id: int) -> dict:
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    db.delete(dept)
    db.commit()
    return {"message": "Department deleted successfully"}
