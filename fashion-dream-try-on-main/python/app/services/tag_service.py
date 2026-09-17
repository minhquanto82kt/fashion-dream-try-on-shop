"""Admin tag data access and CRUD operations."""

from datetime import datetime, timezone
from typing import Any

from app.db.supabase import get_supabase_client


class TagNotFoundError(Exception):
    """Raised when a tag cannot be found."""


class TagConflictError(Exception):
    """Raised when a tag name or slug conflicts with an existing tag."""


def _normalize_text(value: str) -> str:
    return " ".join(value.strip().split())


def _normalize_slug(value: str) -> str:
    return value.strip().lower()


def list_tags(status: str | None = None) -> list[dict[str, Any]]:
    """List tags and aggregate product usage counts."""
    query = get_supabase_client().table("tags").select("*").order("updated_at", desc=True)
    if status:
        query = query.eq("status", status)
    tags_response = query.execute()
    rows = tags_response.data or []
    if not rows:
        return []

    tag_ids = [row["id"] for row in rows]
    links_response = get_supabase_client().table("product_tags").select("tag_id").in_("tag_id", tag_ids).execute()
    counts: dict[str, int] = {}
    for link in links_response.data or []:
        tag_id = str(link.get("tag_id"))
        counts[tag_id] = counts.get(tag_id, 0) + 1
    return [{**row, "product_count": counts.get(str(row["id"]), 0)} for row in rows]


def get_tag(tag_id: str) -> dict[str, Any]:
    """Read one tag by stable UUID."""
    response = get_supabase_client().table("tags").select("*").eq("id", tag_id).limit(1).execute()
    if not response.data:
        raise TagNotFoundError(tag_id)
    row = response.data[0]
    links = get_supabase_client().table("product_tags").select("tag_id").eq("tag_id", tag_id).execute()
    return {**row, "product_count": len(links.data or [])}


def create_tag(*, name: str, slug: str, description: str | None, created_by: str) -> dict[str, Any]:
    """Create a tag owned by the authenticated admin."""
    payload = {
        "name": _normalize_text(name),
        "slug": _normalize_slug(slug),
        "description": _normalize_text(description) if description else None,
        "status": "active",
        "created_by": created_by,
    }
    _ensure_unique(payload["slug"])
    response = get_supabase_client().table("tags").insert(payload).execute()
    if not response.data:
        raise RuntimeError("Failed to create tag")
    return {**response.data[0], "product_count": 0}


def update_tag(tag_id: str, *, name: str | None, slug: str | None, description: str | None, status: str | None) -> dict[str, Any]:
    """Update a tag by stable UUID."""
    current = get_tag(tag_id)
    changes: dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if name is not None:
        changes["name"] = _normalize_text(name)
    if slug is not None:
        normalized_slug = _normalize_slug(slug)
        _ensure_unique(normalized_slug, exclude_id=tag_id)
        changes["slug"] = normalized_slug
    if description is not None:
        changes["description"] = _normalize_text(description) or None
    if status is not None:
        changes["status"] = status
        changes["archived_at"] = datetime.now(timezone.utc).isoformat() if status == "archived" else None
    response = get_supabase_client().table("tags").update(changes).eq("id", tag_id).execute()
    if not response.data:
        raise TagNotFoundError(tag_id)
    return {**response.data[0], "product_count": current.get("product_count", 0)}


def delete_tag(tag_id: str) -> None:
    """Delete a tag and its product links explicitly."""
    get_tag(tag_id)
    get_supabase_client().table("product_tags").delete().eq("tag_id", tag_id).execute()
    response = get_supabase_client().table("tags").delete().eq("id", tag_id).execute()
    if not response.data:
        raise TagNotFoundError(tag_id)


def _ensure_unique(slug: str, *, exclude_id: str | None = None) -> None:
    query = get_supabase_client().table("tags").select("id").eq("slug", slug).limit(1)
    if exclude_id:
        query = query.neq("id", exclude_id)
    response = query.execute()
    if response.data:
        raise TagConflictError(f"Tag slug '{slug}' already exists")
