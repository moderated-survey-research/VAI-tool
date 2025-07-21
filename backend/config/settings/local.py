from .base import *

DEBUG = True

# Allowed hosts
ALLOWED_HOSTS = ["*"]
CSRF_COOKIE_SECURE = False

CSRF_TRUSTED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

# Survey settings
SURVEY_FINGERPRINT_ENABLED = str2bool(
    os.environ.get("SURVEY_FINGERPRINT_ENABLED", False)
)
