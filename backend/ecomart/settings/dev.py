"""Development settings — DEBUG on, lenient CORS, browsable API."""
from .base import *  # noqa: F401,F403
from .base import REST_FRAMEWORK, env

DEBUG = True
ALLOWED_HOSTS = ["*"]

# Allow Vite dev server to call the API
CORS_ALLOWED_ORIGINS = env(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:5173", "http://127.0.0.1:5173"],
)

# Add the browsable API renderer for human inspection during dev
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = (
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
)

# Looser throttling so a developer hammering endpoints isn't rate-limited
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {"anon": "1000/min", "user": "10000/min"}
