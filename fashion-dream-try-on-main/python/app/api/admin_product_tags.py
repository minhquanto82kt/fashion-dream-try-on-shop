"""Protected Admin Product ↔ Tags API."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.admin_tags import require_admin
from app.models.product_tags import ProductTagItem, ProductTagsResponse, ProductTagsUpdate
from app.services.product_tag_service import ProductTagNotFoundError, ProductTagValidationError, list_product_tags, set_product_tags

router = APIRouter(prefix="/api/admin/products", tags=["admin-product-tags"])


@router.get("/{product_id}/tags", response_model=ProductTagsResponse)
def admin_get_product_tags(
    product_id: str,
    _: Annotated[dict[str, Any], Depends(require_admin)] = None,
) -> ProductTagsResponse:
    try:
        tags = [ProductTagItem.model_validate(row) for row in list_product_tags(product_id)]
        return ProductTagsResponse(product_id=product_id, tags=tags)
    except ProductTagNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found") from exc


@router.put("/{product_id}/tags", response_model=ProductTagsResponse)
def admin_set_product_tags(
    product_id: str,
    payload: ProductTagsUpdate,
    _: Annotated[dict[str, Any], Depends(require_admin)] = None,
) -> ProductTagsResponse:
    try:
        tags = [ProductTagItem.model_validate(row) for row in set_product_tags(product_id, payload.tag_ids)]
        return ProductTagsResponse(product_id=product_id, tags=tags)
    except ProductTagNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found") from exc
    except ProductTagValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
