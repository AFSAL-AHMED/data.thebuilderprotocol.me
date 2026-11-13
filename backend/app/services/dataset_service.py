import re
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, update
from sqlalchemy.orm import selectinload

from app.models.dataset import Dataset, DatasetCategory, DatasetStatus
from app.models.activity_log import ActivityLog
from app.schemas.dataset import DatasetCreate, DatasetUpdate


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text


async def generate_unique_slug(db: AsyncSession, title: str, exclude_id: Optional[uuid.UUID] = None) -> str:
    base_slug = slugify(title)
    slug = base_slug
    counter = 1
    while True:
        query = select(Dataset).where(Dataset.slug == slug)
        if exclude_id:
            query = query.where(Dataset.id != exclude_id)
        result = await db.execute(query)
        existing = result.scalar_one_or_none()
        if not existing:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


async def create_dataset(
    db: AsyncSession,
    data: DatasetCreate,
    contributor_id: uuid.UUID,
) -> Dataset:
    slug = await generate_unique_slug(db, data.title)
    dataset = Dataset(
        id=uuid.uuid4(),
        slug=slug,
        contributor_id=contributor_id,
        status=DatasetStatus.pending,
        **data.model_dump(),
    )
    db.add(dataset)
    await db.flush()
    log = ActivityLog(
        id=uuid.uuid4(),
        user_id=contributor_id,
        action="dataset_submitted",
        entity_type="dataset",
        entity_id=dataset.id,
        metadata={"title": data.title, "category": data.category.value},
    )
    db.add(log)
    await db.commit()
    await db.refresh(dataset)
    return dataset


async def get_datasets(
    db: AsyncSession,
    q: Optional[str] = None,
    category: Optional[str] = None,
    file_format: Optional[str] = None,
    licence: Optional[str] = None,
    language: Optional[str] = None,
    sort: str = "recent",
    page: int = 1,
    per_page: int = 20,
    status_filter: Optional[DatasetStatus] = DatasetStatus.approved,
) -> dict:
    query = select(Dataset)
    if status_filter:
        query = query.where(Dataset.status == status_filter)
    if q:
        search = f"%{q}%"
        query = query.where(
            or_(Dataset.title.ilike(search), Dataset.short_description.ilike(search))
        )
    if category:
        query = query.where(Dataset.category == category)
    if licence:
        query = query.where(Dataset.licence == licence)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    if sort == "popular":
        query = query.order_by(Dataset.view_count.desc())
    elif sort == "downloads":
        query = query.order_by(Dataset.download_count.desc())
    else:
        query = query.order_by(Dataset.published_at.desc().nullslast(), Dataset.created_at.desc())

    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    result = await db.execute(query)
    datasets = result.scalars().all()

    return {
        "items": datasets,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, (total + per_page - 1) // per_page),
    }


async def get_dataset_by_slug(db: AsyncSession, slug: str) -> Optional[Dataset]:
    result = await db.execute(select(Dataset).where(Dataset.slug == slug))
    return result.scalar_one_or_none()


async def increment_view_count(db: AsyncSession, dataset_id: uuid.UUID) -> None:
    await db.execute(
        update(Dataset).where(Dataset.id == dataset_id).values(view_count=Dataset.view_count + 1)
    )
    await db.commit()


async def increment_download_count(db: AsyncSession, dataset_id: uuid.UUID) -> None:
    await db.execute(
        update(Dataset).where(Dataset.id == dataset_id).values(download_count=Dataset.download_count + 1)
    )
    await db.commit()


async def update_dataset(
    db: AsyncSession,
    dataset: Dataset,
    data: DatasetUpdate,
    actor_id: uuid.UUID,
) -> Dataset:
    update_data = data.model_dump(exclude_unset=True)
    if "title" in update_data and update_data["title"] != dataset.title:
        update_data["slug"] = await generate_unique_slug(db, update_data["title"], exclude_id=dataset.id)
    for key, value in update_data.items():
        setattr(dataset, key, value)
    dataset.updated_at = datetime.utcnow()
    log = ActivityLog(
        id=uuid.uuid4(),
        user_id=actor_id,
        action="dataset_updated",
        entity_type="dataset",
        entity_id=dataset.id,
        metadata={"fields_updated": list(update_data.keys())},
    )
    db.add(log)
    await db.commit()
    await db.refresh(dataset)
    return dataset


async def get_related_datasets(
    db: AsyncSession,
    dataset: Dataset,
    limit: int = 5,
) -> List[Dataset]:
    result = await db.execute(
        select(Dataset)
        .where(
            Dataset.category == dataset.category,
            Dataset.id != dataset.id,
            Dataset.status == DatasetStatus.approved,
        )
        .order_by(Dataset.view_count.desc())
        .limit(limit)
    )
    return result.scalars().all()
