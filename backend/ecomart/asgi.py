"""ASGI entrypoint (used when channels / websockets are added later)."""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecomart.settings.prod")
application = get_asgi_application()
