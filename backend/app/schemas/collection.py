import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class CollectionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str
    is_featured: bool = False
    dataset_ids: List[str] = []


class CollectionCreate(CollectionBase):
    slug: Optional[str] = None


class CollectionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_featured: Optional[bool] = None
    dataset_ids: Optional[List[str]] = None


class CollectionResponse(CollectionBase):
    id: uuid.UUID
    slug: str
    curator_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
