"""Protected Admin Tags API."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.dependencies import get_current_user
from app.db.supabase import get_supabase_client
from app.models.tag import Tag, TagCreate, TagUpdate
from app.services.tag_service import TagConflictError, TagNotFoundError, create_tag, delete_tag, get_tag, list_tags, update_tag

router = APIRouter(prefix="/api/admin/tags", tags=["admin-tags"])


class TagListResponse(BaseModel):
    items: list[Tag]


def require_admin(user: Annotated[dict[str, Any], Depends(get_current_user)]) -> dict[str, Any]:
    """Require an authenticated user that exists in public.admin_users."""
    user_id = str(user["id"])
    response = get_supabase_client().table("admin_users").select("user_id").eq("user_id", user_id).limit(1).execute()
    if not response.data:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


@router.get("", response_model=TagListResponse)
def admin_list_tags(status_filter: str | None = None, _: Annotated[dict[str, Any], Depends(require_admin)] = None) -> TagListResponse:
    """List tags for the admin catalog."""
    if status_filter not in (None, "active", "archived"):
        raise HTTPException(status_code=400, detail="Invalid tag status")
    return TagListResponse(items=[Tag.model_validate(row) for row in list_tags(status_filter)])


@router.get("/{tag_id}", response_model=Tag)
def admin_get_tag(tag_id: str, _: Annotated[dict[str, Any], Depends(require_admin)] = None) -> Tag:
    try:
        return Tag.model_validate(get_tag(tag_id))
    except TagNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Tag not found") from exc


@router.post("", response_model=Tag, status_code=201)
def admin_create_tag(payload: TagCreate, user: Annotated[dict[str, Any], Depends(require_admin)]) -> Tag:
    try:
        return Tag.model_validate(create_tag(name=payload.name, slug=payload.slug, description=payload.description, created_by=str(user["id"])))
    except TagConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.patch("/{tag_id}", response_model=Tag)
def admin_update_tag(tag_id: str, payload: TagUpdate, _: Annotated[dict[str, Any], Depends(require_admin)] = None) -> Tag:
    try:
        return Tag.model_validate(update_tag(tag_id, name=payload.name, slug=payload.slug, description=payload.description, status=payload.status))
    except TagNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Tag not found") from exc
    except TagConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/{tag_id}", status_code=204)
def admin_delete_tag(tag_id: str, _: Annotated[dict[str, Any], Depends(require_admin)] = None) -> None:
    try:
        delete_tag(tag_id)
    except TagNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Tag not found") from exc
