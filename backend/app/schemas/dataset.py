import uuid
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, HttpUrl
from app.models.dataset import DatasetCategory, DatasetLicence, DatasetStatus, QualitySource


class DatasetBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    short_description: str = Field(..., min_length=1, max_length=1000)
    full_description: str
    category: DatasetCategory
    tags: List[str] = []
    source_url: str
    download_url: Optional[str] = None
    file_format: List[str] = []
    licence: DatasetLicence
    language: List[str] = []
    collection_method: Optional[str] = None
    intended_use: Optional[str] = None
    known_limitations: Optional[str] = None
    citation_info: Optional[str] = None
    geographic_coverage: Optional[str] = None
    num_records: Optional[int] = None
    num_columns: Optional[int] = None
    file_size_bytes: Optional[int] = None
    version: str = "1.0"


class DatasetCreate(DatasetBase):
    pass


class DatasetUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    category: Optional[DatasetCategory] = None
    tags: Optional[List[str]] = None
    source_url: Optional[str] = None
    download_url: Optional[str] = None
    file_format: Optional[List[str]] = None
    licence: Optional[DatasetLicence] = None
    language: Optional[List[str]] = None
    collection_method: Optional[str] = None
    intended_use: Optional[str] = None
    known_limitations: Optional[str] = None
    citation_info: Optional[str] = None
    geographic_coverage: Optional[str] = None
    num_records: Optional[int] = None
    num_columns: Optional[int] = None
    file_size_bytes: Optional[int] = None
    version: Optional[str] = None


class DatasetResponse(DatasetBase):
    id: uuid.UUID
    slug: str
    contributor_id: uuid.UUID
    status: DatasetStatus
    rejection_reason: Optional[str] = None
    review_notes: Optional[str] = None
    is_sample_data: bool
    quality_report: Optional[Any] = None
    quality_source: Optional[QualitySource] = None
    view_count: int
    download_count: int
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DatasetListResponse(BaseModel):
    items: List[DatasetResponse]
    total: int
    page: int
    per_page: int
    pages: int


class DatasetAdminUpdate(BaseModel):
    rejection_reason: Optional[str] = None
    review_notes: Optional[str] = None
    status: Optional[DatasetStatus] = None


class RejectRequest(BaseModel):
    reason: str


class CorrectionRequest(BaseModel):
    notes: str
