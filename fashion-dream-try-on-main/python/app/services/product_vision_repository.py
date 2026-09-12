"""Supabase persistence for normalized Product Vision attributes."""

from __future__ import annotations

from typing import Any

from supabase import Client

from app.db.supabase import get_supabase_client
from app.models.product_vision import ProductVisionResult


class ProductVisionRepository:
    """Persist Product Vision results in the catalog enrichment table."""

    table_name = "product_vision_attributes"

    def __init__(self, client: Client | None = None) -> None:
        self.client = client or get_supabase_client()

    def upsert(self, result: ProductVisionResult) -> dict[str, Any]:
        """Insert or update attributes for one product."""

        if not result.product_id:
            raise ValueError("product_id is required for persistence")

        payload = {
            "product_id": result.product_id,
            "garment_type": result.garment_type.value,
            "colors": result.colors,
            "style_tags": result.style_tags,
            "material": result.material,
            "pattern": result.pattern,
            "confidence": result.confidence,
            "provider": result.provider,
        }

        response = self.client.table(self.table_name).upsert(
            payload,
            on_conflict="product_id",
        ).execute()

        if not response.data:
            raise RuntimeError("Supabase did not return the persisted Product Vision row")

        return response.data[0]

    def get_by_product_id(self, product_id: str) -> dict[str, Any] | None:
        """Return persisted attributes for a product, if present."""

        if not product_id.strip():
            raise ValueError("product_id is required")

        response = (
            self.client.table(self.table_name)
            .select("*")
            .eq("product_id", product_id)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None

    def list_by_product_ids(self, product_ids: list[str]) -> dict[str, dict[str, Any]]:
        """Return persisted attributes for many products with one Supabase query."""

        ids = [product_id.strip() for product_id in product_ids if product_id and product_id.strip()]
        if not ids:
            return {}

        response = (
            self.client.table(self.table_name)
            .select("*")
            .in_("product_id", ids)
            .execute()
        )
        return {
            str(row["product_id"]): row
            for row in (response.data or [])
            if row.get("product_id")
        }
