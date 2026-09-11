# UPTHINK Python Backend

Python services for UPTHINK Fashion Dream.

## Purpose

This layer is reserved for capabilities that belong outside the React/TanStack frontend:

- AI Try-On
- image processing
- product image analysis
- AI Stylist
- product recommendations
- fashion profile intelligence
- analytics and inventory intelligence

## Current status

### P0 — Foundation

FastAPI application structure, configuration, tests, and CI foundation are in place.

### P1 — Supabase bridge

The backend can read active products from the existing `public.products` table through a server-side Supabase client. The Supabase service-role key is never exposed to the frontend.

### P2 — Image Engine foundation

The image layer now supports:

- JPEG, PNG, and WebP validation
- 10 MB upload limit
- MIME type and actual file-format verification
- safe dimension/pixel-count checks
- metadata extraction
- EXIF orientation normalization
- conversion to WebP for downstream processing
- normalized output capped at 4096 px per dimension

Endpoints:

```text
GET  /health
GET  /api/products
GET  /api/products/{product_id}
POST /api/images/validate
POST /api/images/normalize
```

P2 is intentionally **not** the AI Try-On model yet. Model inference, result persistence, job processing, and frontend Try-On wiring belong to P3.

## Structure

```text
python/
├── app/
│   ├── api/
│   │   ├── health.py
│   │   ├── products.py
│   │   └── images.py
│   ├── core/
│   │   └── config.py
│   ├── db/
│   │   └── supabase.py
│   ├── models/
│   │   └── product.py
│   ├── services/
│   │   ├── image_service.py
│   │   └── product_service.py
│   └── main.py
├── tests/
│   ├── test_health.py
│   ├── test_products.py
│   └── test_images.py
├── .env.example
├── requirements.txt
└── README.md
```

## Local development

Create a virtual environment and install dependencies from `requirements.txt`.

Run the API with:

```bash
uvicorn app.main:app --reload
```

Health check:

```text
GET /health
```

## Security

Never commit `.env`, Supabase service-role keys, API keys, model credentials, or other secrets. The service-role key must remain server-side only.
