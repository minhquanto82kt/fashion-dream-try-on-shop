"""FastAPI entry point for the UPTHINK AI backend."""

from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.images import router as images_router
from app.api.product_vision import router as product_vision_router
from app.api.products import router as products_router
from app.api.try_on import router as try_on_router

app = FastAPI(
    title="UPTHINK AI Backend",
    version="0.4.0",
    description="AI and data services for UPTHINK Fashion Dream.",
)

app.include_router(health_router)
app.include_router(products_router)
app.include_router(images_router)
app.include_router(try_on_router)
app.include_router(product_vision_router)
