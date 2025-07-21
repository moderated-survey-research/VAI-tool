from enum import Enum


class AgentID(Enum):
    SUMMARY = "summary"
    SECURITY = "security"
    FOLLOW_UP = "follow_up"
    DISCUSSION = "discussion"
    WRAPPER = "wrapper"


class ChatRole(Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
