import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.dataset import Dataset, DatasetStatus
from app.models.activity_log import ActivityLog
from app.schemas.user import UserResponse, UserPublic, UserUpdate
from app.services.auth_service import get_current_active_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    from datetime import datetime
    current_user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/me/datasets", response_model=List[dict])
async def my_datasets(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Dataset).where(Dataset.contributor_id == current_user.id).order_by(Dataset.created_at.desc())
    )
    datasets = result.scalars().all()
    return [
        {
            "id": str(d.id),
            "title": d.title,
            "slug": d.slug,
            "status": d.status.value,
            "category": d.category.value,
            "created_at": d.created_at.isoformat(),
            "view_count": d.view_count,
            "download_count": d.download_count,
        }
        for d in datasets
    ]


@router.get("/me/contributions", response_model=List[dict])
async def my_contributions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(50)
    )
    logs = result.scalars().all()
    return [
        {
            "id": str(log.id),
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": str(log.entity_id) if log.entity_id else None,
            "metadata": log.metadata,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]


@router.get("/{username}", response_model=UserPublic)
async def get_public_profile(username: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
