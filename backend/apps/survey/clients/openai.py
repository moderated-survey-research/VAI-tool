from typing import Self, Any, Dict
from django.conf import settings
from openai import OpenAI, RateLimitError
import logging
import json
from django.utils.translation import gettext as _
from rest_framework.exceptions import APIException, Throttled
import apps.survey.constants.errorcodes as ERROR_CODES

logger = logging.getLogger("openai")


class OpenAIClient:
    _instance = None

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(OpenAIClient, cls).__new__(cls)
            cls._instance._initialize(*args, **kwargs)
        return cls._instance

    def _initialize(self) -> None:
        self.model = settings.OPENAI_MODEL
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def get_response(self, messages: Dict[str, str], temperature: float) -> str:
        formatted_messages = json.dumps(messages, indent=2, default=str)
        logger.info(f"REQUEST:\n{formatted_messages}")
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                frequency_penalty=0.0,
                presence_penalty=0.0,
                top_p=1.0,
                stream=False,
            )
            formatted_response = json.dumps(response.to_dict(), indent=2, default=str)
            logger.info(f"RESPONSE:\n{formatted_response}")
            return response.choices[0].message.content
        except RateLimitError as e:
            logger.error(f"ERROR: {e}")
            raise Throttled(
                detail=_(
                    "We're sorry, but our service has reached its usage limit at the moment. Please try again later."
                ),
                code=ERROR_CODES.SERVICE_LIMIT_REACHED,
            )
        except Exception as e:
            logger.error(f"ERROR: {e}")
            raise APIException(detail=_("Something went wrong. Please try again."))
