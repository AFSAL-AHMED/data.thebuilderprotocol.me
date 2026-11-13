import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.user import UserCreate, UserResponse, TokenResponse, LoginRequest, RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.services.auth_service import (
    hash_password, authenticate_user, create_access_token,
    create_refresh_token, decode_token, get_user_by_email, get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_email = await db.execute(select(User).where(User.email == data.email))
    if existing_email.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    existing_username = await db.execute(select(User).where(User.username == data.username))
    if existing_username.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        id=uuid.uuid4(),
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        bio=data.bio,
        organisation=data.organisation,
        areas_of_interest=data.areas_of_interest or [],
        avatar_url=data.avatar_url,
    )
    db.add(user)
    log = ActivityLog(
        id=uuid.uuid4(),
        user_id=user.id,
        action="user_registered",
        entity_type="user",
        entity_id=user.id,
        metadata={"email": data.email, "username": data.username},
    )
    db.add(log)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    log = ActivityLog(
        id=uuid.uuid4(),
        user_id=user.id,
        action="user_login",
        entity_type="user",
        entity_id=user.id,
        metadata={},
    )
    db.add(log)
    await db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    # JWT is stateless; client must discard the token
    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    access_token = create_access_token({"sub": str(user.id)})
    new_refresh_token = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, data.email)
    # Always return 200 to prevent user enumeration
    return {"message": "If that email is registered, a password reset link has been sent."}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(data.token)
        if payload.get("type") not in ("access", "reset"):
            raise HTTPException(status_code=400, detail="Invalid reset token")
        user_id = uuid.UUID(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = hash_password(data.new_password)
    await db.commit()
    return {"message": "Password reset successfully"}
