from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.datasets import router as datasets_router
from app.routers.collections import router as collections_router
from app.routers.admin import router as admin_router
from app.routers.issue_reports import router as issues_router

__all__ = [
    "auth_router", "users_router", "datasets_router",
    "collections_router", "admin_router", "issues_router",
]
