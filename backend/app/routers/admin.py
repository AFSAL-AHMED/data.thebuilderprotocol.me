import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.user import User, UserRole
from app.models.dataset import Dataset, DatasetStatus, DatasetCategory
from app.models.activity_log import ActivityLog
from app.models.issue_report import IssueReport
from app.schemas.user import ChangeRoleRequest
from app.schemas.dataset import RejectRequest, CorrectionRequest
from app.services.auth_service import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    total_datasets = await db.execute(select(func.count(Dataset.id)))
    pending_datasets = await db.execute(
        select(func.count(Dataset.id)).where(Dataset.status == DatasetStatus.pending)
    )
    approved_datasets = await db.execute(
        select(func.count(Dataset.id)).where(Dataset.status == DatasetStatus.approved)
    )
    total_users = await db.execute(select(func.count(User.id)))
    total_issues = await db.execute(select(func.count(IssueReport.id)))
    open_issues = await db.execute(
        select(func.count(IssueReport.id)).where(IssueReport.status == "open")
    )

    return {
        "total_datasets": total_datasets.scalar(),
        "pending_datasets": pending_datasets.scalar(),
        "approved_datasets": approved_datasets.scalar(),
        "total_users": total_users.scalar(),
        "total_issues": total_issues.scalar(),
        "open_issues": open_issues.scalar(),
    }


@router.get("/submissions")
async def list_submissions(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    query = select(Dataset)
    if status:
        query = query.where(Dataset.status == status)
    else:
        query = query.where(Dataset.status == DatasetStatus.pending)
    query = query.order_by(Dataset.created_at.asc())
    result = await db.execute(query)
    datasets = result.scalars().all()
    return [
        {
            "id": str(d.id),
            "title": d.title,
            "slug": d.slug,
            "category": d.category.value,
            "contributor_id": str(d.contributor_id),
            "status": d.status.value,
            "created_at": d.created_at.isoformat(),
            "source_url": d.source_url,
        }
        for d in datasets
    ]


@router.post("/submissions/{dataset_id}/approve")
async def approve_dataset(
    dataset_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    dataset.status = DatasetStatus.approved
    dataset.published_at = datetime.utcnow()
    dataset.updated_at = datetime.utcnow()
    log = ActivityLog(
        id=uuid.uuid4(),
        user_id=admin.id,
        action="dataset_approved",
        entity_type="dataset",
        entity_id=dataset.id,
        metadata={"title": dataset.title},
    )
    db.add(log)
    await db.commit()
    return {"message": "Dataset approved", "id": str(dataset.id)}


@router.post("/submissions/{dataset_id}/reject")
async def reject_dataset(
    dataset_id: uuid.UUID,
    data: RejectRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    dataset.status = DatasetStatus.rejected
    dataset.rejection_reason = data.reason
    dataset.updated_at = datetime.utcnow()
    log = ActivityLog(
        id=uuid.uuid4(),
        user_id=admin.id,
        action="dataset_rejected",
        entity_type="dataset",
        entity_id=dataset.id,
        metadata={"reason": data.reason},
    )
    db.add(log)
    await db.commit()
    return {"message": "Dataset rejected"}


@router.post("/submissions/{dataset_id}/request-correction")
async def request_correction(
    dataset_id: uuid.UUID,
    data: CorrectionRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    dataset.status = DatasetStatus.correction_requested
    dataset.review_notes = data.notes
    dataset.updated_at = datetime.utcnow()
    log = ActivityLog(
        id=uuid.uuid4(),
        user_id=admin.id,
        action="dataset_correction_requested",
        entity_type="dataset",
        entity_id=dataset.id,
        metadata={"notes": data.notes},
    )
    db.add(log)
    await db.commit()
    return {"message": "Correction requested"}


@router.put("/datasets/{dataset_id}/unpublish")
async def unpublish_dataset(
    dataset_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    dataset.status = DatasetStatus.pending
    dataset.published_at = None
    dataset.updated_at = datetime.utcnow()
    await db.commit()
    return {"message": "Dataset unpublished"}


@router.get("/categories")
async def list_categories(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(Dataset.category, func.count(Dataset.id).label("count"))
        .where(Dataset.status == DatasetStatus.approved)
        .group_by(Dataset.category)
    )
    rows = result.all()
    return [{"category": row.category.value, "count": row.count} for row in rows]


@router.get("/contributors")
async def list_contributors(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role.value,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.put("/contributors/{user_id}/role")
async def change_user_role(
    user_id: uuid.UUID,
    data: ChangeRoleRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = data.role
    await db.commit()
    return {"message": f"Role updated to {data.role.value}"}


@router.get("/activity")
async def recent_activity(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(100)
    )
    logs = result.scalars().all()
    return [
        {
            "id": str(log.id),
            "user_id": str(log.user_id) if log.user_id else None,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": str(log.entity_id) if log.entity_id else None,
            "metadata": log.metadata,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]


@router.get("/issues")
async def admin_issues(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(IssueReport).order_by(IssueReport.created_at.desc())
    )
    issues = result.scalars().all()
    return [
        {
            "id": str(i.id),
            "dataset_id": str(i.dataset_id),
            "reporter_id": str(i.reporter_id) if i.reporter_id else None,
            "reporter_email": i.reporter_email,
            "issue_type": i.issue_type.value,
            "description": i.description,
            "status": i.status.value,
            "created_at": i.created_at.isoformat(),
        }
        for i in issues
    ]
