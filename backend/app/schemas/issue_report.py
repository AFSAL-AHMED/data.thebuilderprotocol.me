import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.issue_report import IssueType, IssueStatus


class IssueReportCreate(BaseModel):
    dataset_id: uuid.UUID
    reporter_email: Optional[EmailStr] = None
    issue_type: IssueType
    description: str


class IssueReportUpdate(BaseModel):
    status: IssueStatus


class IssueReportResponse(BaseModel):
    id: uuid.UUID
    dataset_id: uuid.UUID
    reporter_id: Optional[uuid.UUID] = None
    reporter_email: Optional[str] = None
    issue_type: IssueType
    description: str
    status: IssueStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
