import uuid
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.database import get_db
from app.models.user import User
from app.models.dataset import Dataset, DatasetStatus, QualitySource
from app.models.activity_log import ActivityLog
from app.schemas.dataset import (
    DatasetCreate, DatasetUpdate, DatasetResponse, DatasetListResponse
)
from app.services.auth_service import get_current_active_user, get_optional_user
from app.services.dataset_service import (
    create_dataset, get_datasets, get_dataset_by_slug,
    increment_view_count, increment_download_count,
    update_dataset, get_related_datasets,
)
from app.services.csv_inspector import inspect_csv_from_url

router = APIRouter(prefix="/api/datasets", tags=["datasets"])


@router.get("/featured", response_model=list)
async def featured_datasets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Dataset)
        .where(Dataset.is_sample_data == True, Dataset.status == DatasetStatus.approved)
        .order_by(Dataset.view_count.desc())
        .limit(10)
    )
    datasets = result.scalars().all()
    return [_dataset_to_dict(d) for d in datasets]


@router.get("/recent", response_model=list)
async def recent_datasets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Dataset)
        .where(Dataset.status == DatasetStatus.approved)
        .order_by(Dataset.published_at.desc().nullslast())
        .limit(10)
    )
    datasets = result.scalars().all()
    return [_dataset_to_dict(d) for d in datasets]


@router.get("/", response_model=DatasetListResponse)
async def list_datasets(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    file_format: Optional[str] = Query(None),
    licence: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    sort: str = Query("recent"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await get_datasets(
        db, q=q, category=category, file_format=file_format,
        licence=licence, language=language, sort=sort, page=page, per_page=per_page,
    )
    return result


@router.get("/{slug}/related")
async def related_datasets(slug: str, db: AsyncSession = Depends(get_db)):
    dataset = await get_dataset_by_slug(db, slug)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    related = await get_related_datasets(db, dataset)
    return [_dataset_to_dict(d) for d in related]


@router.get("/{slug}", response_model=DatasetResponse)
async def get_dataset(
    slug: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    dataset = await get_dataset_by_slug(db, slug)
    if not dataset or dataset.status != DatasetStatus.approved:
        raise HTTPException(status_code=404, detail="Dataset not found")
    background_tasks.add_task(increment_view_count, db, dataset.id)
    return dataset


@router.post("/", response_model=DatasetResponse, status_code=201)
async def submit_dataset(
    data: DatasetCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    dataset = await create_dataset(db, data, current_user.id)
    return dataset


@router.put("/{slug}", response_model=DatasetResponse)
async def update_dataset_endpoint(
    slug: str,
    data: DatasetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.user import UserRole
    dataset = await get_dataset_by_slug(db, slug)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    if dataset.contributor_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorised to edit this dataset")
    updated = await update_dataset(db, dataset, data, current_user.id)
    return updated


@router.post("/{slug}/download")
async def record_download(
    slug: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    dataset = await get_dataset_by_slug(db, slug)
    if not dataset or dataset.status != DatasetStatus.approved:
        raise HTTPException(status_code=404, detail="Dataset not found")
    background_tasks.add_task(increment_download_count, db, dataset.id)
    if current_user:
        log = ActivityLog(
            id=uuid.uuid4(),
            user_id=current_user.id,
            action="dataset_downloaded",
            entity_type="dataset",
            entity_id=dataset.id,
            metadata={"slug": slug},
        )
        db.add(log)
        await db.commit()
    return {"message": "Download recorded", "download_url": dataset.download_url or dataset.source_url}


@router.post("/{slug}/inspect")
async def inspect_dataset(
    slug: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    dataset = await get_dataset_by_slug(db, slug)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    if dataset.contributor_id != current_user.id:
        from app.models.user import UserRole
        if current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="Not authorised")

    url = dataset.download_url or dataset.source_url
    if not url:
        raise HTTPException(status_code=400, detail="No URL available for inspection")

    report = await inspect_csv_from_url(url)
    if not report:
        raise HTTPException(status_code=422, detail="Could not inspect CSV at that URL")

    dataset.quality_report = report
    dataset.quality_source = QualitySource.auto_calculated
    if report.get("row_count"):
        dataset.num_records = report["row_count"]
    if report.get("column_count"):
        dataset.num_columns = report["column_count"]
    if report.get("file_size_bytes"):
        dataset.file_size_bytes = report["file_size_bytes"]
    await db.commit()
    return report


def _dataset_to_dict(d: Dataset) -> dict:
    return {
        "id": str(d.id),
        "title": d.title,
        "slug": d.slug,
        "short_description": d.short_description,
        "category": d.category.value,
        "tags": d.tags,
        "file_format": d.file_format,
        "licence": d.licence.value,
        "language": d.language,
        "num_records": d.num_records,
        "view_count": d.view_count,
        "download_count": d.download_count,
        "published_at": d.published_at.isoformat() if d.published_at else None,
        "status": d.status.value,
        "is_sample_data": d.is_sample_data,
    }
