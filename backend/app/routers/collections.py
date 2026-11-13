import uuid
import re
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.collection import Collection
from app.models.dataset import Dataset, DatasetStatus
from app.schemas.collection import CollectionCreate, CollectionUpdate, CollectionResponse
from app.services.auth_service import get_current_admin

router = APIRouter(prefix="/api/collections", tags=["collections"])


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return re.sub(r'^-+|-+$', '', text)


@router.get("/", response_model=List[CollectionResponse])
async def list_collections(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection).order_by(Collection.is_featured.desc(), Collection.created_at.desc()))
    return result.scalars().all()


@router.get("/{slug}")
async def get_collection(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection).where(Collection.slug == slug))
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    # Fetch datasets in collection
    dataset_uuids = []
    for did in collection.dataset_ids:
        try:
            dataset_uuids.append(uuid.UUID(did))
        except (ValueError, TypeError):
            pass

    datasets = []
    if dataset_uuids:
        ds_result = await db.execute(
            select(Dataset).where(
                Dataset.id.in_(dataset_uuids),
                Dataset.status == DatasetStatus.approved,
            )
        )
        datasets = [
            {
                "id": str(d.id),
                "title": d.title,
                "slug": d.slug,
                "short_description": d.short_description,
                "category": d.category.value,
                "file_format": d.file_format,
                "licence": d.licence.value,
                "num_records": d.num_records,
            }
            for d in ds_result.scalars().all()
        ]

    return {
        "id": str(collection.id),
        "title": collection.title,
        "slug": collection.slug,
        "description": collection.description,
        "is_featured": collection.is_featured,
        "curator_id": str(collection.curator_id),
        "dataset_ids": collection.dataset_ids,
        "datasets": datasets,
        "created_at": collection.created_at.isoformat(),
        "updated_at": collection.updated_at.isoformat(),
    }


@router.post("/", response_model=CollectionResponse, status_code=201)
async def create_collection(
    data: CollectionCreate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    slug = data.slug or slugify(data.title)
    # Ensure unique slug
    base = slug
    counter = 1
    while True:
        existing = await db.execute(select(Collection).where(Collection.slug == slug))
        if not existing.scalar_one_or_none():
            break
        slug = f"{base}-{counter}"
        counter += 1

    collection = Collection(
        id=uuid.uuid4(),
        title=data.title,
        slug=slug,
        description=data.description,
        curator_id=current_admin.id,
        is_featured=data.is_featured,
        dataset_ids=data.dataset_ids,
    )
    db.add(collection)
    await db.commit()
    await db.refresh(collection)
    return collection


@router.put("/{slug}", response_model=CollectionResponse)
async def update_collection(
    slug: str,
    data: CollectionUpdate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Collection).where(Collection.slug == slug))
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(collection, key, value)
    collection.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(collection)
    return collection


@router.delete("/{slug}", status_code=204)
async def delete_collection(
    slug: str,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Collection).where(Collection.slug == slug))
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    await db.delete(collection)
    await db.commit()
