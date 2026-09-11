"""FastAPI entry point for the UPTHINK AI backend."""

from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.products import router as products_router

app = FastAPI(
    title="UPTHINK AI Backend",
    version="0.1.0",
    description="AI and data services for UPTHINK Fashion Dream.",
)

app.include_router(health_router)
app.include_router(products_router)
