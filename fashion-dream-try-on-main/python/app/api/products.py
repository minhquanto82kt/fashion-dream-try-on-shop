"""Product API endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.models.product import Product
from app.services.product_service import (
    ProductNotFoundError,
    get_active_product,
    list_active_products,
)

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[Product])
def list_products() -> list[Product]:
    """Return all active products."""

    return [Product.model_validate(row) for row in list_active_products()]


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str) -> Product:
    """Return one active product."""

    try:
        row = get_active_product(product_id)
    except ProductNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        ) from exc
    return Product.model_validate(row)
