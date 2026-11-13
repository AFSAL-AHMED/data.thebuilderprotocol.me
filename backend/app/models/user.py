import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Enum, JSON, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class UserRole(str, enum.Enum):
    contributor = "contributor"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    organisation: Mapped[str | None] = mapped_column(String(255), nullable=True)
    areas_of_interest: Mapped[list] = mapped_column(JSON, default=list)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="userrole"), default=UserRole.contributor, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    datasets: Mapped[list["Dataset"]] = relationship("Dataset", back_populates="contributor", foreign_keys="Dataset.contributor_id")
    collections: Mapped[list["Collection"]] = relationship("Collection", back_populates="curator")
    issue_reports: Mapped[list["IssueReport"]] = relationship("IssueReport", back_populates="reporter")
    activity_logs: Mapped[list["ActivityLog"]] = relationship("ActivityLog", back_populates="user")
