from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import create_tables
from app.middleware.rate_limit import limiter, rate_limit_exceeded_handler
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.datasets import router as datasets_router
from app.routers.collections import router as collections_router
from app.routers.admin import router as admin_router
from app.routers.issue_reports import router as issues_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if they don't exist
    await create_tables()
    yield
    # Shutdown: nothing to clean up for now


app = FastAPI(
    title="TBP Dataset Commons API",
    description="Backend API for The Builder Protocol Dataset Commons — an open data repository platform.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(datasets_router)
app.include_router(collections_router)
app.include_router(admin_router)
app.include_router(issues_router)


@app.get("/api/health", tags=["health"])
async def health_check():
    return {"status": "ok", "service": "TBP Dataset Commons API", "version": "1.0.0"}


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "Not found"})


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
