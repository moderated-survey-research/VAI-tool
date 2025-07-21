from enum import Enum


class QuestionTypeEnum(Enum):
    INPUT = "input"
    TEXTAREA = "textarea"
    NUMERIC = "numeric"
    CHECKBOX = "checkbox"
    RADIO = "radio"
    BOOLEAN = "boolean"
    SCALE = "scale"
