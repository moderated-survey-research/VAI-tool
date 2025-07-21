import os
from urllib.parse import urlparse
from .base import *


DEBUG = False

# HTTPS settings
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# HSTS settings
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# Allowed hosts
ALLOWED_HOSTS = [urlparse(os.environ.get("FRONTEND_HOST")).netloc]
CSRF_TRUSTED_ORIGINS = [os.environ.get("FRONTEND_HOST")]
CORS_ALLOWED_ORIGINS = [os.environ.get("FRONTEND_HOST")]

# Cache settings
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f"redis://{os.environ.get('REDIS_HOST', '127.0.0.1')}:{os.environ.get('REDIS_PORT', '6379')}/{os.environ.get('REDIS_DB', '0')}",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    }
}

# Survey settings
SURVEY_FINGERPRINT_ENABLED = str2bool(
    os.environ.get("SURVEY_FINGERPRINT_ENABLED", True)
)
