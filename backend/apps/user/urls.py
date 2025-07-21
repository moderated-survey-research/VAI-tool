from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .views import AuthViewSet

urlpatterns = [
    path("login", TokenObtainPairView.as_view()),
    path("logout", AuthViewSet.as_view({"post": "logout"})),
    path("refresh", TokenRefreshView.as_view()),
    path("me", AuthViewSet.as_view({"get": "me"})),
]
