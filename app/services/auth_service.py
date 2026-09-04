from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.hospital import Hospital
from app.models.user import User, UserRole
from app.schemas.user import HospitalSignup, Token, UserLogin, UserOut


def register_hospital(db: Session, data: HospitalSignup) -> UserOut:
    existing_hospital = (
        db.query(Hospital)
        .filter(Hospital.slug == data.hospital_slug)
        .first()
    )

    if existing_hospital:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hospital slug already registered",
        )

    hospital = Hospital(
        name=data.hospital_name,
        slug=data.hospital_slug,
    )

    db.add(hospital)
    db.flush()

    existing_user = (
        db.query(User)
        .filter(
            User.hospital_id == hospital.id,
            User.email == data.email,
        )
        .first()
    )

    if existing_user:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered for this hospital",
        )

    user = User(
        hospital_id=hospital.id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=UserRole.admin,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return UserOut.model_validate(user)


def login_user(db: Session, data: UserLogin) -> Token:
    hospital = (
        db.query(Hospital)
        .filter(Hospital.slug == data.hospital_slug)
        .first()
    )

    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect hospital, email, or password",
        )

    user = (
        db.query(User)
        .filter(
            User.hospital_id == hospital.id,
            User.email == data.email,
        )
        .first()
    )

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect hospital, email, or password",
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "hospital_id": user.hospital_id,
            "role": user.role.value,
        }
    )

    return Token(access_token=token)
