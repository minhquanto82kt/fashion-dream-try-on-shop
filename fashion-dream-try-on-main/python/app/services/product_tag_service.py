"""Admin service for assigning tags to products."""

from typing import Any

from app.db.supabase import get_supabase_client


class ProductTagNotFoundError(Exception):
    """Raised when the product does not exist."""


class ProductTagValidationError(Exception):
    """Raised when one or more tag IDs are invalid."""


def list_product_tags(product_id: str) -> list[dict[str, Any]]:
    """Read tags currently assigned to a product."""
    client = get_supabase_client()

    product = (
        client.table("products")
        .select("id")
        .eq("id", product_id)
        .limit(1)
        .execute()
    )
    if not product.data:
        raise ProductTagNotFoundError(product_id)

    links = (
        client.table("product_tags")
        .select("tag_id")
        .eq("product_id", product_id)
        .execute()
    )
    tag_ids = [str(row["tag_id"]) for row in (links.data or [])]
    if not tag_ids:
        return []

    tags = (
        client.table("tags")
        .select("id,name,slug,status")
        .in_("id", tag_ids)
        .execute()
    )
    by_id = {str(row["id"]): row for row in (tags.data or [])}
    return [by_id[tag_id] for tag_id in tag_ids if tag_id in by_id]


def set_product_tags(product_id: str, tag_ids: list[str]) -> list[dict[str, Any]]:
    """Assign exactly the requested tags to a product."""
    client = get_supabase_client()

    product = (
        client.table("products")
        .select("id")
        .eq("id", product_id)
        .limit(1)
        .execute()
    )
    if not product.data:
        raise ProductTagNotFoundError(product_id)

    unique_ids = list(dict.fromkeys(tag_ids))
    if unique_ids:
        tags = (
            client.table("tags")
            .select("id,status")
            .in_("id", unique_ids)
            .execute()
        )
        found = {str(row["id"]): row for row in (tags.data or [])}
        missing = [tag_id for tag_id in unique_ids if tag_id not in found]
        if missing:
            raise ProductTagValidationError("One or more tags do not exist")
        archived = [tag_id for tag_id in unique_ids if found[tag_id].get("status") == "archived"]
        if archived:
            raise ProductTagValidationError("Archived tags cannot be assigned to products")

        client.table("product_tags").upsert(
            [{"product_id": product_id, "tag_id": tag_id} for tag_id in unique_ids],
            on_conflict="product_id,tag_id",
        ).execute()

    current = (
        client.table("product_tags")
        .select("tag_id")
        .eq("product_id", product_id)
        .execute()
    )
    current_ids = {str(row["tag_id"]) for row in (current.data or [])}
    requested_ids = set(unique_ids)
    stale_ids = current_ids - requested_ids
    if stale_ids:
        client.table("product_tags").delete().eq("product_id", product_id).in_("tag_id", list(stale_ids)).execute()

    return list_product_tags(product_id)
