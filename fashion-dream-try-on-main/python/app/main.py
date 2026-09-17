"""FastAPI entry point for the UPTHINK AI backend."""

from fastapi import FastAPI

from app.api.admin_product_tags import router as admin_product_tags_router
from app.api.admin_tags import router as admin_tags_router
from app.api.health import router as health_router
from app.api.images import router as images_router
from app.api.product_vision import router as product_vision_router
from app.api.products import router as products_router
from app.api.recommendations import router as recommendations_router
from app.api.stylist import router as stylist_router
from app.api.try_on import router as try_on_router
from app.api.try_on_internal import router as try_on_internal_router

app = FastAPI(
    title="UPTHINK AI Backend",
    version="0.5.0",
    description="AI, data and admin services for UPTHINK Fashion Dream.",
)

app.include_router(health_router)
app.include_router(products_router)
app.include_router(admin_tags_router)
app.include_router(admin_product_tags_router)
app.include_router(images_router)
app.include_router(try_on_router)
app.include_router(try_on_internal_router)
app.include_router(product_vision_router)
app.include_router(recommendations_router)
app.include_router(stylist_router)
