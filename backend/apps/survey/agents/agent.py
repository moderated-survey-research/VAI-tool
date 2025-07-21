from .base import BaseAgent, ChatAgent
from apps.survey.enums import (
    ChatRole,
    ChatType,
    QuestionTypeEnum,
    SectionTypeEnum,
    AgentID,
)
from typing import List
from apps.survey.models import Message, Section, Question, Chat, Answer
from django.conf import settings
from django.contrib.admin.options import get_content_type_for_model
from django.db.models import Prefetch, Exists, OuterRef, Prefetch, Q, Manager
from apps.survey.config import PROMPTS, PROMPT_PARAMS

POSTGRES_INT_MAX = 2147483647


class FollowUpAgent(ChatAgent):
    temperature = 0.7

    def __init__(self, chat: Chat):
        super().__init__(chat=chat)
        message_count = self.count_messages(role=ChatRole.ASSISTANT)
        is_final_message = message_count + 1 >= settings.SURVEY_FOLLOW_UP_THRESHOLD
        if is_final_message:
            self.system_message = (
                PROMPTS.get(chat.submission.survey.type)
                .get(AgentID.WRAPPER.value)
                .get(AgentID.FOLLOW_UP.value)
            )
        else:
            self.system_message = PROMPTS.get(chat.submission.survey.type).get(
                AgentID.FOLLOW_UP.value
            )

    def _get_answer(self, question: Question) -> str:
        formatted_answer = ""
        selected_answers = getattr(question, "selected_answers", [])
        match question.type:
            case QuestionTypeEnum.SCALE.value:
                for answer in selected_answers:
                    option_value = question.scale.options.get(str(answer.content))
                    formatted_answer += f", {option_value}"
            case QuestionTypeEnum.RADIO.value | QuestionTypeEnum.CHECKBOX.value:
                for answer in selected_answers:
                    for choice in answer.choices.all():
                        formatted_answer += f", {choice.option.content}"
            case _:
                for answer in selected_answers:
                    formatted_answer += f", {answer.content}"
        return formatted_answer

    def _set_context(self):
        self.system_message = self.system_message.format(
            SUMMARY=self.chat.submission.summary.content,
            QUESTION=self.chat.content_object.content,
            ANSWER=self._get_answer(self.chat.content_object),
            INTERACTION_PLACE=f"Questionnaire - {self.chat.content_object.section.title}",
            QUESTIONNAIRE=PROMPT_PARAMS.get(
                self.chat.content_object.section.survey.key
            ).get("QUESTIONNAIRE"),
            SURVEY_FRAMEWORK=PROMPT_PARAMS.get(self.chat.submission.survey.key).get(
                "SURVEY_FRAMEWORK"
            ),
        )

    def generate_follow_up(self, answer: str) -> List[Message]:
        self._set_context()
        user_message = self.add_to_messages(ChatRole.USER, answer)
        response = self.get_response()
        assistant_message = self.add_to_messages(ChatRole.ASSISTANT, response)
        return [user_message, assistant_message]

    def get_prompts(self) -> dict:
        self.system_message = self.system_message = (
            PROMPTS.get(self.chat.submission.survey.type)
            .get(AgentID.WRAPPER.value)
            .get(AgentID.FOLLOW_UP.value)
        )
        self._set_context()
        wrapper_prompt = self.system_message
        self.system_message = PROMPTS.get(self.chat.submission.survey.type).get(
            AgentID.FOLLOW_UP.value
        )
        self._set_context()
        prompt = self.system_message
        return {"prompt": prompt, "wrapper_prompt": wrapper_prompt}


class DiscussionAgent(ChatAgent):
    temperature = 0.7

    def __init__(self, chat: Chat):
        super().__init__(chat=chat)
        message_count = self.count_messages(role=ChatRole.ASSISTANT)
        is_final_message = message_count + 1 >= settings.SURVEY_DISCUSSION_THRESHOLD
        if is_final_message:
            self.system_message = (
                PROMPTS.get(chat.submission.survey.type)
                .get(AgentID.WRAPPER.value)
                .get(AgentID.DISCUSSION.value)
            )
        else:
            self.system_message = PROMPTS.get(chat.submission.survey.type).get(
                AgentID.DISCUSSION.value
            )

    def _set_context(self):
        results = getattr(
            self.chat.content_object.questionnaire_section, "selected_results", []
        )
        result = results[0] if results else None
        self.system_message = self.system_message.format(
            SUMMARY=self.chat.submission.summary.content,
            INTERACTION_PLACE=f"Section - {self.chat.content_object.title}",
            RESULTS=result.data if result else None,
            SURVEY_FRAMEWORK=PROMPT_PARAMS.get(self.chat.submission.survey.key).get(
                "SURVEY_FRAMEWORK"
            ),
        )

    def generate_message(self, message: str) -> List[Message]:
        self._set_context()
        user_message = self.add_to_messages(ChatRole.USER, message)
        response = self.get_response()
        assistant_message = self.add_to_messages(ChatRole.ASSISTANT, response)
        return [user_message, assistant_message]

    def get_prompts(self) -> dict:
        self.system_message = self.system_message = (
            PROMPTS.get(self.chat.submission.survey.type)
            .get(AgentID.WRAPPER.value)
            .get(AgentID.DISCUSSION.value)
        )
        self._set_context()
        wrapper_prompt = self.system_message
        self.system_message = PROMPTS.get(self.chat.submission.survey.type).get(
            AgentID.DISCUSSION.value
        )
        self._set_context()
        prompt = self.system_message
        return {"prompt": prompt, "wrapper_prompt": wrapper_prompt}


class SecurityAgent(BaseAgent):
    temperature = 0.0
    system_message = PROMPTS.get(AgentID.SECURITY.value)

    def _set_context(self, question: str, answer: str):
        self.system_message = self.system_message.format(
            QUESTION=question, ANSWER=answer
        )

    def check_answer(self, question: str, answer: str) -> bool:
        self._set_context(question, answer)
        response = self.get_response()
        return response.lower().strip() == "yes"


class SummaryAgent(BaseAgent):
    temperature: float = 0.0
    system_message = PROMPTS.get(AgentID.SUMMARY.value)

    def _set_context(self, user_progress: str):
        self.system_message = self.system_message.format(
            PREVIOUS_SUMMARY=self.submission.summary.content,
            USER_PROGRESS=user_progress,
            SURVEY_FRAMEWORK=PROMPT_PARAMS.get(self.submission.survey.key).get(
                "SURVEY_FRAMEWORK"
            ),
            WORD_LIMIT=settings.SURVEY_SUMMARY_WORD_LIMIT,
        )

    def _format_user_progress(self, sections: Manager[Section]) -> list:
        user_progress = []
        if not sections:
            return None
        for section in sections.all():
            section_detail = {
                "section": section.title,
                "discussions": [],
                "questions": [],
            }

            discussion_chats = getattr(section, "discussion_chats", [])
            section_detail["discussions"] = [
                {"role": message.role, "content": message.content}
                for chat in discussion_chats
                for message in chat.messages.all()
            ]
            for question in section.questions.all():
                question_detail = {
                    "question": question.content,
                    "is_attention_check": question.is_attention_check,
                    "answers": [],
                    "follow_up_chats": [],
                }
                selected_answers = getattr(question, "selected_answers", [])
                match question.type:
                    case QuestionTypeEnum.SCALE.value:
                        for answer in selected_answers:
                            option_value = question.scale.options.get(
                                str(answer.content)
                            )
                            question_detail["answers"].append(option_value)
                    case QuestionTypeEnum.RADIO.value | QuestionTypeEnum.CHECKBOX.value:
                        for answer in selected_answers:
                            for choice in answer.choices.all():
                                question_detail["answers"].append(choice.option.content)
                    case _:
                        for answer in selected_answers:
                            question_detail["answers"].append(answer.content)
                follow_up_chats = getattr(question, "follow_up_chats", [])
                question_detail["follow_up_chats"] = [
                    {"role": message.role, "content": message.content}
                    for chat in follow_up_chats
                    for message in chat.messages.all()
                ]
                section_detail["questions"].append(question_detail)
            user_progress.append(section_detail)

        return user_progress

    def _get_current_context(
        self,
        current_activity: Section | Question,
    ) -> List[str]:
        user_progress = ""
        summary_last_activity = self.submission.summary.content_object
        summary_last_section = None
        summary_last_question = None

        if summary_last_activity:
            if isinstance(summary_last_activity, Section):
                summary_last_section = summary_last_activity
            elif isinstance(summary_last_activity, Question):
                summary_last_section = summary_last_activity.section
                summary_last_question = summary_last_activity

        sections = (
            Section.objects.filter(survey=self.submission.survey)
            .annotate(
                has_discussions=Exists(
                    Chat.objects.filter(
                        submission=self.submission.id,
                        type=ChatType.DISCUSSION.value,
                        sections=OuterRef("pk"),
                    )
                ),
                has_questions_with_answers=Exists(
                    Question.objects.filter(
                        section=OuterRef("pk"),
                        answers__submission=self.submission.id,
                        order__gt=(
                            summary_last_question.order if summary_last_question else 0
                        ),
                        order__lte=(
                            current_activity.order
                            if isinstance(current_activity, Question)
                            else POSTGRES_INT_MAX
                        ),
                    )
                ),
            )
            .filter(Q(has_discussions=True) | Q(has_questions_with_answers=True))
            .filter(
                Q(
                    order__gt=(
                        summary_last_section.order
                        if summary_last_section
                        and summary_last_section.type
                        != SectionTypeEnum.QUESTIONNAIRE.value
                        else 0
                    )
                )
                & Q(
                    order__lte=(
                        current_activity.order
                        if isinstance(current_activity, Section)
                        else (
                            current_activity.section.order
                            if isinstance(current_activity, Question)
                            else POSTGRES_INT_MAX
                        )
                    )
                )
            )
            .prefetch_related(
                Prefetch(
                    "chats",
                    queryset=Chat.objects.filter(
                        submission=self.submission.id, type=ChatType.DISCUSSION.value
                    ).prefetch_related("messages"),
                    to_attr="discussion_chats",
                ),
                Prefetch(
                    "questions",
                    queryset=Question.objects.filter(
                        order__gt=(
                            summary_last_question.order if summary_last_question else 0
                        ),
                        order__lte=(
                            current_activity.order
                            if isinstance(current_activity, Question)
                            else POSTGRES_INT_MAX
                        ),
                    ).prefetch_related(
                        Prefetch(
                            "answers",
                            queryset=Answer.objects.filter(
                                submission=self.submission.id
                            ).prefetch_related("choices__option"),
                            to_attr="selected_answers",
                        ),
                        Prefetch(
                            "chats",
                            queryset=Chat.objects.filter(
                                submission=self.submission.id,
                                type=ChatType.FOLLOW_UP.value,
                            ).prefetch_related("messages"),
                            to_attr="follow_up_chats",
                        ),
                        "scale",
                    ),
                ),
            )
        )

        user_progress = self._format_user_progress(sections)

        return [user_progress]

    def update_summary(
        self,
        current_activity: Section | Question,
    ) -> str:
        [user_progress] = self._get_current_context(current_activity=current_activity)
        if user_progress is None:
            return self.submission.summary.content
        self._set_context(
            user_progress=user_progress,
        )
        updated_summary = self.get_response()
        self.submission.summary.content = updated_summary
        self.submission.summary.content_type = get_content_type_for_model(
            current_activity
        )
        self.submission.summary.object_id = current_activity.id
        self.submission.summary.save()
        return updated_summary
