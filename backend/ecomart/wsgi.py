"""WSGI entrypoint (gunicorn uses this in prod)."""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecomart.settings.prod")
application = get_wsgi_application()
