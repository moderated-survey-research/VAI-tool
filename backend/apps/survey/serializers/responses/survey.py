from rest_framework import serializers
from apps.survey.models import Survey, Section, Question, Option, Scale


class ScaleResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scale
        fields = ["id", "key", "options"]


class OptionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "content", "order", "requires_input"]


class QuestionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "content",
            "key",
            "type",
            "order",
            "is_required",
            "has_follow_up",
            "options",
            "scale",
        ]

    options = OptionResponseSerializer(many=True)
    scale = ScaleResponseSerializer()


class SectionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = [
            "id",
            "key",
            "title",
            "content",
            "type",
            "order",
            "is_required",
            "is_ai_assisted",
            "has_discussion",
            "questions",
        ]

    questions = QuestionResponseSerializer(many=True)


class SurveyResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Survey
        fields = ["id", "name", "description", "key", "type", "sections"]

    sections = SectionResponseSerializer(many=True)


class BasicSurveyResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Survey
        fields = ["id", "name", "description", "key"]
