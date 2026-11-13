import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Enum, JSON, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class IssueType(str, enum.Enum):
    broken_link = "broken_link"
    incorrect_metadata = "incorrect_metadata"
    licensing_problem = "licensing_problem"
    data_quality = "data_quality"
    privacy_concern = "privacy_concern"
    other = "other"


class IssueStatus(str, enum.Enum):
    open = "open"
    under_review = "under_review"
    resolved = "resolved"
    dismissed = "dismissed"


class IssueReport(Base):
    __tablename__ = "issue_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False, index=True
    )
    reporter_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    reporter_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    issue_type: Mapped[IssueType] = mapped_column(
        Enum(IssueType, name="issuetype"), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[IssueStatus] = mapped_column(
        Enum(IssueStatus, name="issuestatus"), default=IssueStatus.open, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    dataset: Mapped["Dataset"] = relationship("Dataset", back_populates="issue_reports")
    reporter: Mapped["User | None"] = relationship("User", back_populates="issue_reports")
