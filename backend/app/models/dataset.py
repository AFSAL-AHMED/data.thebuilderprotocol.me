import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Enum, JSON, DateTime, Text, BigInteger, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class DatasetCategory(str, enum.Enum):
    ai_ml = "ai_ml"
    nlp = "nlp"
    computer_vision = "computer_vision"
    scientific_research = "scientific_research"
    climate_environment = "climate_environment"
    geospatial = "geospatial"
    software_engineering = "software_engineering"
    public_data = "public_data"
    language_culture = "language_culture"
    other = "other"


class DatasetLicence(str, enum.Enum):
    cc0 = "cc0"
    cc_by = "cc_by"
    cc_by_sa = "cc_by_sa"
    cc_by_nc = "cc_by_nc"
    apache_2 = "apache_2"
    mit = "mit"
    proprietary = "proprietary"
    other = "other"


class DatasetStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    correction_requested = "correction_requested"


class QualitySource(str, enum.Enum):
    contributor_provided = "contributor_provided"
    auto_calculated = "auto_calculated"
    human_reviewed = "human_reviewed"


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(600), unique=True, index=True, nullable=False)
    short_description: Mapped[str] = mapped_column(String(1000), nullable=False)
    full_description: Mapped[str] = mapped_column(Text, nullable=False)
    contributor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    category: Mapped[DatasetCategory] = mapped_column(
        Enum(DatasetCategory, name="datasetcategory"), nullable=False
    )
    tags: Mapped[list] = mapped_column(JSON, default=list)
    source_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    download_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    file_format: Mapped[list] = mapped_column(JSON, default=list)
    licence: Mapped[DatasetLicence] = mapped_column(
        Enum(DatasetLicence, name="datasetlicence"), nullable=False
    )
    language: Mapped[list] = mapped_column(JSON, default=list)
    collection_method: Mapped[str | None] = mapped_column(Text, nullable=True)
    intended_use: Mapped[str | None] = mapped_column(Text, nullable=True)
    known_limitations: Mapped[str | None] = mapped_column(Text, nullable=True)
    citation_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[DatasetStatus] = mapped_column(
        Enum(DatasetStatus, name="datasetstatus"), default=DatasetStatus.pending, nullable=False
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_sample_data: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    num_records: Mapped[int | None] = mapped_column(Integer, nullable=True)
    num_columns: Mapped[int | None] = mapped_column(Integer, nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    quality_report: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    quality_source: Mapped[QualitySource | None] = mapped_column(
        Enum(QualitySource, name="qualitysource"), nullable=True
    )
    geographic_coverage: Mapped[str | None] = mapped_column(String(500), nullable=True)
    version: Mapped[str] = mapped_column(String(50), default="1.0", nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    download_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    contributor: Mapped["User"] = relationship("User", back_populates="datasets", foreign_keys=[contributor_id])
    issue_reports: Mapped[list["IssueReport"]] = relationship("IssueReport", back_populates="dataset")
