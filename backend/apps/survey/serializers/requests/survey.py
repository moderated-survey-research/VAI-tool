from rest_framework import serializers


class DispatchSurveyRequestSerializer(serializers.Serializer):
    emails = serializers.ListField(child=serializers.EmailField(), allow_empty=False)
