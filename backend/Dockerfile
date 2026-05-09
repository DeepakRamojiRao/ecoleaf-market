# syntax=docker/dockerfile:1.7
# Multi-stage: `dev` for hot-reload local work, `prod` for gunicorn deploy.

# ---------- base ----------
FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential libpq-dev curl \
 && rm -rf /var/lib/apt/lists/*

# ---------- dev ----------
FROM base AS dev
COPY requirements/ requirements/
RUN pip install -r requirements/dev.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# ---------- prod ----------
FROM base AS prod
RUN useradd --create-home --shell /bin/bash app
COPY requirements/ requirements/
RUN pip install -r requirements/prod.txt
COPY --chown=app:app . .
USER app
EXPOSE 8000
CMD ["gunicorn", "ecomart.wsgi:application", \
     "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60"]
