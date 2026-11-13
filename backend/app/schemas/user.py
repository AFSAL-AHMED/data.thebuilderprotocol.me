import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=255)
    bio: Optional[str] = None
    organisation: Optional[str] = None
    areas_of_interest: List[str] = []
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    organisation: Optional[str] = None
    areas_of_interest: Optional[List[str]] = None
    avatar_url: Optional[str] = None


class UserPublic(BaseModel):
    id: uuid.UUID
    username: str
    full_name: str
    bio: Optional[str] = None
    organisation: Optional[str] = None
    areas_of_interest: List[str] = []
    avatar_url: Optional[str] = None
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


class UserResponse(UserPublic):
    email: EmailStr
    is_active: bool
    is_email_verified: bool
    updated_at: datetime


class UserAdminView(UserResponse):
    pass


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class ChangeRoleRequest(BaseModel):
    role: UserRole
