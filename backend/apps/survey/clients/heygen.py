from typing import Self, Any
from django.conf import settings
import httpx
import logging
import json
from django.utils.translation import gettext as _
from rest_framework.exceptions import APIException, Throttled
import apps.survey.constants.errorcodes as ERROR_CODES


logger = logging.getLogger("heygen")


class HeyGenClient:
    _instance = None

    def __new__(cls, *args: Any, **kwargs: Any) -> Self:
        if cls._instance is None:
            cls._instance = super(HeyGenClient, cls).__new__(cls)
            cls._instance._initialize(*args, **kwargs)
        return cls._instance

    def _initialize(self) -> None:
        self.client = httpx.Client(
            base_url=settings.HEYGEN_API_URL,
            headers={"x-api-key": settings.HEYGEN_API_KEY},
        )

    def _call_api(
        self, method: str, endpoint: str, data: dict = None, **kwargs: Any
    ) -> dict:
        try:
            logger.info(f"REQUEST: {method} {endpoint}")
            request = self.client.build_request(
                method, url=endpoint, data=data, **kwargs
            )
            response = self.client.send(request)
            response.raise_for_status()
            response = response.json()
            formatted_response = json.dumps(response, indent=2, default=str)
            logger.info(f"RESPONSE:\n{formatted_response}")
            return response
        except httpx.HTTPStatusError as e:
            logger.error(f"ERROR: {e}")
            if e.response.status_code == 429:
                raise Throttled(
                    detail=_(
                        "We're sorry, but our service has reached its usage limit at the moment. Please try again later."
                    ),
                    code=ERROR_CODES.SERVICE_LIMIT_REACHED,
                )
            raise APIException(detail=_("Something went wrong. Please try again."))
        except Exception as e:
            logger.error(f"ERROR: {e}")
            raise APIException(detail=_("Something went wrong. Please try again."))

    def get_access_token(self) -> str:
        response = self._call_api("post", "/v1/streaming.create_token")
        return response["data"]["token"]

    def close_session(self, session_id: str) -> None:
        self._call_api("post", "/v1/streaming.stop", data={"session_id": session_id})

    def list_sessions(self) -> list:
        try:
            logger.info("REQUEST: List sessions")
            response = self.client.get("/v1/streaming.list_sessions")
            formatted_response = json.dumps(response.json(), indent=2, default=str)
            logger.info(f"RESPONSE:\n{formatted_response}")
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.error(f"ERROR: {e}")
            if e.response.status_code == 429:
                raise Throttled(
                    detail=_(
                        "We're sorry, but our service has reached its usage limit at the moment. Please try again later."
                    ),
                    code=ERROR_CODES.SERVICE_LIMIT_REACHED,
                )
            raise APIException(detail=_("Something went wrong. Please try again."))
        except Exception as e:
            logger.error(f"ERROR: {e}")
            raise APIException(detail=_("Something went wrong. Please try again."))
        return response.json()["data"]["sessions"]
