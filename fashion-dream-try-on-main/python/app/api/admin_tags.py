"""Protected Admin Tags API."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.dependencies import get_current_admin
from app.models.tag import Tag, TagCreate, TagUpdate
from app.services.tag_service import TagConflictError, TagNotFoundError, create_tag, delete_tag, get_tag, list_tags, update_tag

router = APIRouter(prefix="/api/admin/tags", tags=["admin-tags"])


class TagListResponse(BaseModel):
    items: list[Tag]


@router.get("", response_model=TagListResponse)
def admin_list_tags(
    status_filter: str | None = None,
    _: Annotated[dict, Depends(get_current_admin)] = None,
) -> TagListResponse:
    """List tags for the admin catalog."""
    if status_filter not in (None, "active", "archived"):
        raise HTTPException(status_code=400, detail="Invalid tag status")
    return TagListResponse(items=[Tag.model_validate(row) for row in list_tags(status_filter)])


@router.get("/{tag_id}", response_model=Tag)
def admin_get_tag(
    tag_id: str,
    _: Annotated[dict, Depends(get_current_admin)] = None,
) -> Tag:
    try:
        return Tag.model_validate(get_tag(tag_id))
    except TagNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Tag not found") from exc


@router.post("", response_model=Tag, status_code=201)
def admin_create_tag(
    payload: TagCreate,
    user: Annotated[dict, Depends(get_current_admin)],
) -> Tag:
    try:
        return Tag.model_validate(
            create_tag(
                name=payload.name,
                slug=payload.slug,
                description=payload.description,
                created_by=str(user["id"]),
            )
        )
    except TagConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.patch("/{tag_id}", response_model=Tag)
def admin_update_tag(
    tag_id: str,
    payload: TagUpdate,
    _: Annotated[dict, Depends(get_current_admin)] = None,
) -> Tag:
    try:
        fields = payload.model_fields_set
        return Tag.model_validate(
            update_tag(
                tag_id,
                name=payload.name if "name" in fields else None,
                slug=payload.slug if "slug" in fields else None,
                description=payload.description if "description" in fields else None,
                status=payload.status if "status" in fields else None,
            )
        )
    except TagNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Tag not found") from exc
    except TagConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/{tag_id}", status_code=204)
def admin_delete_tag(
    tag_id: str,
    _: Annotated[dict, Depends(get_current_admin)] = None,
) -> None:
    try:
        delete_tag(tag_id)
    except TagNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Tag not found") from exc
