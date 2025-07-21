from enum import Enum


class SubmissionStatusEnum(Enum):
    INITIATED = "initiated"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    EXITED = "exited"
    TERMINATED = "terminated"
