from django.urls import path, include
from apps.user import urls as user_urls
from apps.survey import urls as survey_urls

urlpatterns = [
    path(r"auth/", include(user_urls)),
    path(r"surveys/", include(survey_urls)),
]
