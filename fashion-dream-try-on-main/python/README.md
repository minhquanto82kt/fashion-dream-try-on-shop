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

**P0 — Foundation**

The backend currently exposes a health endpoint only. No AI model or Supabase integration is enabled yet.

## Structure

```text
python/
├── app/
│   ├── api/
│   │   └── health.py
│   ├── core/
│   │   └── config.py
│   ├── services/
│   └── main.py
├── tests/
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

Expected response:

```json
{
  "status": "ok",
  "service": "upthink-python"
}
```

## Security

Never commit `.env`, Supabase service-role keys, API keys, model credentials, or other secrets. The service-role key must remain server-side only.
