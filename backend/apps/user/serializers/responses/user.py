from rest_framework import serializers
from apps.user.models import User


class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "is_staff", "is_superuser"]
