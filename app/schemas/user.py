from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class HospitalSignup(BaseModel):
    hospital_name: str = Field(min_length=2, max_length=255)
    hospital_slug: str = Field(min_length=2, max_length=100)
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    hospital_slug: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    hospital_id: int

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
