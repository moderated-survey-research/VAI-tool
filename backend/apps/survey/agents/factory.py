from .base import BaseAgent, ChatAgent
from .agent import (
    FollowUpAgent,
    SecurityAgent,
    SummaryAgent,
    DiscussionAgent,
)
from apps.survey.enums import AgentID
from apps.survey.models import Chat, Submission


class AgentFactory:
    @staticmethod
    def base_agent(agent_id: AgentID, submission: Submission) -> BaseAgent:
        agents = {
            AgentID.SECURITY.value: SecurityAgent,
            AgentID.SUMMARY.value: SummaryAgent,
        }
        if agent_id.value not in agents:
            raise ValueError(f"Unknown agent: {agent_id.value}")
        return agents[agent_id.value](submission)

    @staticmethod
    def chat_agent(chat: Chat) -> ChatAgent:
        agents = {
            AgentID.FOLLOW_UP.value: FollowUpAgent,
            AgentID.DISCUSSION.value: DiscussionAgent,
        }
        if chat.agent_id not in agents:
            raise ValueError(f"Unknown agent: {chat.agent_id}")
        return agents[chat.agent_id](chat)
