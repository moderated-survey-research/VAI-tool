from typing import Self, Any
from django.utils.translation import gettext as _
from apps.survey.models import Submission, Section, Question
from apps.survey.agents import AgentFactory, SummaryAgent
from apps.survey.enums import AgentID


class SummaryService:
    _instance = None

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(SummaryService, cls).__new__(cls)
        return cls._instance

    def update(
        self: Self,
        current_activity: Section | Question,
        submission: Submission,
    ) -> str:
        summary_agent: SummaryAgent = AgentFactory.base_agent(
            agent_id=AgentID.SUMMARY, submission=submission
        )
        return summary_agent.update_summary(
            current_activity=current_activity,
        )
