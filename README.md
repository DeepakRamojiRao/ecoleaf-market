# EcoMart — Eco-friendly Ecommerce Platform

Production-grade storefront for eco-friendly products: banana leaves, flowers,
paper cups & glasses, paper sheets, arecanut plates & cups, wooden spoons, and
leaf plates. Supports retail orders, bulk B2B inquiries, and WhatsApp contact.

## Stack

- **Backend:** Django 5.1, DRF, PostgreSQL, Redis, Celery, JWT auth
- **Frontend:** React 19 + Vite 5 + TypeScript, Tailwind v4, TanStack Query, Zustand
- **Infra:** Docker Compose (dev), gunicorn + whitenoise (prod)
- **Integrations:** Meta WhatsApp Cloud API, click-to-chat fallback

## Quick start (dev)

Prereqs: Docker Desktop, Node 20+, Python 3.12+, Git.

```bash
# 1. Clone and copy env templates
git clone https://github.com/DeepakRamojiRao/ecoleaf-market.git
cd ecoleaf-market
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env

# 2. Boot infra + apps
docker compose up --build

# 3. Apply migrations and seed (one-time, in another terminal)
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

- Backend → http://localhost:8000 (admin: /admin, API: /api/v1, schema: /api/schema/swagger)
- Frontend → http://localhost:5173

## Project layout

See [docs](#) (added in later modules) or browse `backend/` and `frontend/`.

## License

MIT
