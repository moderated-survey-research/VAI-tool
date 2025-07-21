from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from apps.user.serializers.responses import UserResponseSerializer
from rest_framework.request import Request
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication


class AuthViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def me(request: Request) -> Response:
        serializer = UserResponseSerializer(request.user)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    def logout(request: Request) -> Response:
        try:
            token = RefreshToken(request.data.get("refresh"))
            token.blacklist()
        except Exception:
            pass
        return Response(None, status=status.HTTP_200_OK)
