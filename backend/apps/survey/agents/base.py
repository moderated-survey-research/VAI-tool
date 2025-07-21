from typing import Dict, List
from apps.survey.clients.openai import OpenAIClient
from apps.survey.models import Message, Chat, Submission
from apps.survey.enums import ChatRole


class BaseAgent:
    temperature: float = 0.0
    system_message: str = ""
    messages: List[Dict[str, str]] = []

    def __init__(self, submission: Submission):
        self.client = OpenAIClient()
        self.submission = submission

    def get_response(self) -> str:
        messages = [
            {
                "role": ChatRole.SYSTEM.value,
                "content": self.system_message,
            },
        ] + self.messages
        return self.client.get_response(messages=messages, temperature=self.temperature)

    def add_to_messages(self, role: ChatRole, content: str):
        message = {
            "role": role.value,
            "content": content,
        }
        self.messages.append(message)

    def clear_messages(self):
        self.messages = []

    def count_messages(self, role: ChatRole | None = None) -> int:
        if role is None:
            return len(self.messages)
        return sum(1 for message in self.messages if message["role"] == role.value)

    def remove_last_message(self):
        self.messages.pop()


class ChatAgent(BaseAgent):
    def __init__(self, chat: Chat):
        super().__init__(chat.submission)
        self.chat = chat
        self.messages = [
            {"role": message.role, "content": message.content}
            for message in chat.messages.all()
        ]

    def save_flagged_message(self, content: str) -> Message:
        return Message.objects.create(
            chat=self.chat,
            role=ChatRole.USER.value,
            content=content,
            is_flagged=True,
        )

    def add_to_messages(self, role: ChatRole, content: str) -> Message:
        super().add_to_messages(role, content)
        return Message.objects.create(
            chat=self.chat,
            role=role.value,
            content=content,
        )

    def flag_last_user_message(self):
        last_user_message = self.chat.messages.last()
        if last_user_message.role == ChatRole.USER.value:
            last_user_message.is_flagged = True
            last_user_message.save()
        if self.messages[-1]["role"] == ChatRole.USER.value:
            self.remove_last_message()
