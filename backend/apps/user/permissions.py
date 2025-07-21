from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.request import Request


class IsStaff(IsAuthenticated):
    def has_permission(self, request: Request, view: APIView) -> bool:
        return super().has_permission(request, view) and request.user.is_staff


class IsSuperUser(IsAuthenticated):
    def has_permission(self, request: Request, view: APIView) -> bool:
        return super().has_permission(request, view) and request.user.is_superuser
