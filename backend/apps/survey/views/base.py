from rest_framework import viewsets
from apps.survey.request import SubmissionAPIRequest


class SubmissionAPIBaseViewSet(viewsets.ViewSet):
    def initialize_request(self, request, *args, **kwargs):
        request = super().initialize_request(request, *args, **kwargs)
        return SubmissionAPIRequest(
            request._request,
            parsers=request.parsers,
            authenticators=request.authenticators,
            negotiator=request.negotiator,
            parser_context=request.parser_context,
        )
