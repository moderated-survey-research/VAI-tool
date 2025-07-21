from rest_framework import serializers
from apps.survey.models import (
    Choice,
    Section,
    Question,
    Option,
    Submission,
    Result,
    Answer,
    Scale,
    Chat,
)
from apps.survey.models import Message
from django.utils.translation import gettext as _
from typing import Any
from apps.survey.enums import ChatType


class ScaleResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scale
        fields = ["id", "key", "options"]


class ChoiceResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "content", "option_id"]


class AnswerResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["id", "content", "explanation", "choices"]

    choices = ChoiceResponseSerializer(many=True)


class OptionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "content", "order", "requires_input"]


class MessageResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "content", "role"]


class ChatResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = [
            "id",
            "is_required",
            "is_closed",
            "messages",
            "required_messages_count",
            "final_note",
            "final_note_submitted_at",
        ]

    messages = MessageResponseSerializer(many=True)


class QuestionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "preheading",
            "content",
            "subheading",
            "key",
            "type",
            "order",
            "is_required",
            "answer",
            "chats",
            "options",
            "scale",
            "requires_explanation",
        ]

    chats = serializers.SerializerMethodField(method_name="get_chats")
    options = OptionResponseSerializer(many=True)
    scale = ScaleResponseSerializer()
    answer = serializers.SerializerMethodField(method_name="get_answer")

    def __init__(self, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)

        submission: Submission | None = self.context.get("submission")
        if submission is None:
            raise ValueError(_("Submission context is required."))
        self.submission: Submission = submission

    def get_answer(self, obj: Question):
        selected_answers = getattr(obj, "selected_answers", [])
        answer = selected_answers[0] if selected_answers else None
        return AnswerResponseSerializer(answer).data if answer is not None else None

    def get_chats(self, obj: Question):
        follow_up_chats = getattr(obj, "follow_up_chats", [])
        follow_up_chat = follow_up_chats[0] if follow_up_chats else None
        return {
            ChatType.FOLLOW_UP.value: (
                ChatResponseSerializer(instance=follow_up_chat).data
                if follow_up_chat is not None
                else None
            )
        }


class ResultResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = ["id", "data", "completed_at"]


class QuestionnaireSectionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = [
            "id",
            "key",
            "result",
        ]

    result = serializers.SerializerMethodField(method_name="get_result")

    def get_result(self, obj: Section):
        selected_results = getattr(obj, "selected_results", [])
        selected_result = selected_results[0] if selected_results else None
        return (
            ResultResponseSerializer(selected_result).data
            if selected_result is not None
            else None
        )


class SectionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = [
            "id",
            "key",
            "title",
            "subtitle",
            "content",
            "type",
            "order",
            "is_required",
            "is_ai_assisted",
            "result",
            "questionnaire_section",
            "questions",
            "chats",
        ]

    questions = serializers.SerializerMethodField(method_name="get_questions")
    result = serializers.SerializerMethodField(method_name="get_result")
    chats = serializers.SerializerMethodField(method_name="get_chats")
    questionnaire_section = QuestionnaireSectionResponseSerializer()

    def __init__(self, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)

        submission: Submission | None = self.context.get("submission")
        if submission is None:
            raise ValueError(_("Submission context is required."))
        self.submission: Submission = submission

    def get_questions(self, obj: Section):
        questions = obj.questions.all()
        return QuestionResponseSerializer(
            questions, many=True, context=self.context
        ).data

    def get_result(self, obj: Section):
        selected_results = getattr(obj, "selected_results", [])
        selected_result = selected_results[0] if selected_results else None
        return (
            ResultResponseSerializer(selected_result).data
            if selected_result is not None
            else None
        )

    def get_chats(self, obj: Question):
        discussion_chats = getattr(obj, "discussion_chats", [])
        discussion_chat = discussion_chats[0] if discussion_chats else None
        return {
            ChatType.DISCUSSION.value: (
                ChatResponseSerializer(instance=discussion_chat).data
                if discussion_chat is not None
                else None
            )
        }


class SubmissionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = [
            "id",
            "survey_id",
            "avatar_id",
            "name",
            "description",
            "key",
            "type",
            "questionnaire_type",
            "sections",
            "summary",
            "privacy_consent_given_at",
            "expires_at",
        ]

    survey_id = serializers.IntegerField(source="survey.id")
    name = serializers.CharField(source="survey.name")
    description = serializers.CharField(source="survey.description")
    key = serializers.CharField(source="survey.key")
    type = serializers.CharField(source="survey.type")
    questionnaire_type = serializers.CharField(source="survey.questionnaire_type")
    sections = serializers.SerializerMethodField(method_name="get_sections")

    def get_sections(self, obj: Submission):
        return SectionResponseSerializer(
            obj.survey.sections,
            many=True,
            context={"submission": self.instance},
        ).data


class SubmissionAuthResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ["id", "survey_id", "token", "expires_at"]

    survey_id = serializers.IntegerField(source="survey.id")
