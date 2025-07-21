from django.urls import path
from apps.survey.views import (
    SurveyViewSet,
    SectionViewSet,
    SubmissionViewSet,
    AnswerViewSet,
    ResultViewSet,
    AvatarViewSet,
    FollowUpViewSet,
    DiscussionViewSet,
    ChatSessionViewSet,
)

urlpatterns = [
    path("", SurveyViewSet.as_view({"get": "list"})),
    path("<str:survey_id>", SurveyViewSet.as_view({"get": "retrieve"})),
    path(
        "<str:survey_id>/dispatch", SurveyViewSet.as_view({"post": "dispatch_emails"})
    ),
    path(
        "<str:survey_id>/submissions",
        SubmissionViewSet.as_view(
            {"post": "create", "get": "retrieve", "delete": "exit"}
        ),
    ),
    path(
        "<str:survey_id>/submissions/privacy-consent",
        SubmissionViewSet.as_view({"post": "privacy_consent_given"}),
    ),
    path(
        "<str:survey_id>/submissions/sections/<int:section_id>",
        SectionViewSet.as_view({"get": "retrieve"}),
    ),
    path(
        "<str:survey_id>/submissions/sections/<int:section_id>/chats/discussions/prompts",
        DiscussionViewSet.as_view({"get": "prompts"}),
    ),
    path(
        "<str:survey_id>/submissions/sections/<int:section_id>/chats/discussions/messages",
        DiscussionViewSet.as_view({"post": "create"}),
    ),
    path(
        "<str:survey_id>/submissions/sections/<int:section_id>/chats/discussions/close",
        DiscussionViewSet.as_view({"post": "close"}),
    ),
    path(
        "<str:survey_id>/submissions/sections/<int:section_id>/chats/discussions/final-notes",
        DiscussionViewSet.as_view({"post": "final_note"}),
    ),
    path(
        "<str:survey_id>/submissions/sections/<int:section_id>/questions/<int:question_id>/answers",
        AnswerViewSet.as_view({"post": "create"}),
    ),
    path(
        "<str:survey_id>/submissions/sections/<int:section_id>/questions/<int:question_id>/chats/follow-ups/prompts",
        FollowUpViewSet.as_view({"get": "prompts"}),
    ),
    path(
        "<str:survey_id>/submissions/sections/<int:section_id>/questions/<int:question_id>/chats/follow-ups/messages",
        FollowUpViewSet.as_view({"post": "create"}),
    ),
    path(
        "<str:survey_id>/submissions/sections/<int:section_id>/questions/<int:question_id>/chats/follow-ups/final-notes",
        FollowUpViewSet.as_view({"post": "final_note"}),
    ),
    path(
        "<str:survey_id>/submissions/sections/<int:section_id>/questions/<int:question_id>/chats/follow-ups/close",
        FollowUpViewSet.as_view({"post": "close"}),
    ),
    path(
        "<str:survey_id>/submissions/sections/<int:section_id>/results",
        ResultViewSet.as_view({"post": "create"}),
    ),
    path(
        "<str:survey_id>/submissions/complete",
        SubmissionViewSet.as_view({"post": "complete"}),
    ),
    path(
        "<str:survey_id>/submissions/avatars/tokens",
        AvatarViewSet.as_view({"post": "token"}),
    ),
    path(
        "<str:survey_id>/submissions/avatars/<str:avatar_id>",
        AvatarViewSet.as_view({"post": "set_avatar"}),
    ),
    path(
        "<str:survey_id>/submissions/chats/<int:chat_id>/messages/<int:message_id>/asked",
        ChatSessionViewSet.as_view({"post": "message_asked"}),
    ),
    path(
        "<str:survey_id>/submissions/chats/<int:chat_id>/messages/<int:message_id>/answering",
        ChatSessionViewSet.as_view({"post": "started_answering_message"}),
    ),
]
