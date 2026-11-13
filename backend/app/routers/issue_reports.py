import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.issue_report import IssueReport
from app.schemas.issue_report import IssueReportCreate, IssueReportUpdate, IssueReportResponse
from app.services.auth_service import get_current_admin, get_optional_user

router = APIRouter(prefix="/api/issues", tags=["issues"])


@router.post("/", response_model=IssueReportResponse, status_code=201)
async def submit_issue(
    data: IssueReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    report = IssueReport(
        id=uuid.uuid4(),
        dataset_id=data.dataset_id,
        reporter_id=current_user.id if current_user else None,
        reporter_email=data.reporter_email if not current_user else None,
        issue_type=data.issue_type,
        description=data.description,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/", response_model=List[IssueReportResponse])
async def list_issues(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(IssueReport).order_by(IssueReport.created_at.desc())
    )
    return result.scalars().all()


@router.put("/{issue_id}", response_model=IssueReportResponse)
async def update_issue(
    issue_id: uuid.UUID,
    data: IssueReportUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    result = await db.execute(select(IssueReport).where(IssueReport.id == issue_id))
    issue = result.scalar_one_or_none()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    issue.status = data.status
    from datetime import datetime
    issue.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(issue)
    return issue
