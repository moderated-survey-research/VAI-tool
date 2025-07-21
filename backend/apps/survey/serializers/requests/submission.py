from rest_framework import serializers
from django.utils.translation import gettext as _
from apps.survey.models import Answer, Choice, Question
from apps.survey.models import Message
from apps.survey.enums import QuestionTypeEnum, ChatRole
from typing import Any
from drf_writable_nested import WritableNestedModelSerializer


class FingerprintRequestSerializer(serializers.Serializer):
    fingerprint = serializers.CharField(
        required=True, allow_null=False, allow_blank=False, max_length=255
    )


class GuidRequestSerializer(serializers.Serializer):
    guid = serializers.CharField(
        required=True, allow_null=True, allow_blank=False, max_length=255
    )


class ChoiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["option_id", "content"]

    content = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, max_length=500
    )

    def __init__(self, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)

        question: Question | None = self.context.get("question")
        if question is None:
            raise ValueError(_("Question context is required."))
        self.question: Question = question
        self.options_map = {option.id: option for option in self.question.options.all()}

    def get_fields(self) -> dict[str, Any]:
        fields = super().get_fields()
        fields["option_id"] = serializers.ChoiceField(
            choices=self.options_map.keys(),
            required=True,
            allow_null=False,
            allow_blank=False,
        )
        return fields

    def validate(self, data: dict[str, Any]) -> dict[str, Any]:
        data = super().validate(data)
        option_id = data.get("option_id")
        option = self.options_map.get(option_id) if option_id else None
        if option and option.requires_input and not data.get("content"):
            raise serializers.ValidationError(_("Content is required."))
        return data


class AnswerRequestSerializer(WritableNestedModelSerializer):
    explanation = serializers.CharField(
        max_length=500,
        required=False,
        allow_null=True,
        allow_blank=False,
    )

    class Meta:
        model = Answer
        fields = ["explanation"]

    def __init__(self, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)

        question: Question | None = self.context.get("question")
        if question is None:
            raise ValueError(_("Question context is required."))
        self.question: Question = question

    def get_fields(self) -> dict[str, Any]:
        fields = super().get_fields()
        match self.question.type:
            case QuestionTypeEnum.CHECKBOX.value:
                fields["choices"] = ChoiceRequestSerializer(
                    many=True,
                    context=self.context,
                    required=True,
                    allow_null=not self.question.is_required,
                    allow_empty=not self.question.is_required,
                    max_length=self.question.options.count(),
                )
            case QuestionTypeEnum.RADIO.value:
                fields["choices"] = ChoiceRequestSerializer(
                    many=True,
                    context=self.context,
                    required=True,
                    allow_null=not self.question.is_required,
                    allow_empty=not self.question.is_required,
                    max_length=1,
                )
            case QuestionTypeEnum.INPUT.value | QuestionTypeEnum.TEXTAREA.value:
                fields["content"] = serializers.CharField(
                    required=True,
                    allow_null=not self.question.is_required,
                    allow_blank=False,
                    max_length=500,
                )
            case QuestionTypeEnum.NUMERIC.value:
                fields["content"] = serializers.IntegerField(
                    required=True,
                    allow_null=not self.question.is_required,
                    min_value=-1000000,
                    max_value=1000000,
                )
            case QuestionTypeEnum.BOOLEAN.value:
                fields["content"] = serializers.BooleanField(
                    required=True,
                    allow_null=not self.question.is_required,
                )
            case QuestionTypeEnum.SCALE.value:
                fields["content"] = serializers.IntegerField(
                    required=True,
                    allow_null=not self.question.is_required,
                    min_value=self.question.scale.min_value,
                    max_value=self.question.scale.max_value,
                )

        return fields


class ClassicSurveyMessageRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["content"]

    content = serializers.CharField(
        max_length=500,
        required=True,
        allow_null=True,
        allow_blank=False,
    )


class FinalNoteRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["content"]

    content = serializers.CharField(
        max_length=500,
        required=True,
        allow_null=True,
        allow_blank=False,
    )


class AvatarSurveyMessageRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["content", "role"]

    role = serializers.ChoiceField(
        choices=[
            (enum.value, enum.name) for enum in [ChatRole.USER, ChatRole.ASSISTANT]
        ],
        required=True,
        allow_null=False,
        allow_blank=False,
    )
    content = serializers.CharField(
        max_length=1000,
        required=True,
        allow_null=True,
        allow_blank=False,
    )
