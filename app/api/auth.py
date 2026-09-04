from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import HospitalSignup, Token, UserLogin, UserOut
from app.services import auth_service


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(
    data: HospitalSignup,
    db: Session = Depends(get_db),
):
    return auth_service.register_hospital(db, data)


@router.post("/login", response_model=Token)
def login(
    data: UserLogin,
    db: Session = Depends(get_db),
):
    return auth_service.login_user(db, data)


@router.post(
    "/token",
    response_model=Token,
    summary="OAuth2 token endpoint (for Swagger UI)",
)
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Form-based login for Swagger UI.

    The OAuth2 username field must contain:
    hospital_slug|email
    """
    try:
        hospital_slug, email = form_data.username.split("|", 1)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must use the format hospital_slug|email",
        )

    return auth_service.login_user(
        db,
        UserLogin(
            hospital_slug=hospital_slug,
            email=email,
            password=form_data.password,
        ),
    )
