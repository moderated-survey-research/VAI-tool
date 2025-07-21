from mailtrap import MailFromTemplate, Address, MailtrapClient
from django.conf import settings
from typing import Self


class EmailService:
    _instance = None

    def __new__(cls, *args, **kwargs) -> Self:
        if cls._instance is None:
            cls._instance = super(EmailService, cls).__new__(cls)
            cls._instance._initialize(*args, **kwargs)
        return cls._instance

    def _initialize(self) -> None:
        self.sender_email = settings.EMAIL_SENDER_EMAIL
        self.sender_name = settings.APP_NAME
        self.client = MailtrapClient(token=settings.EMAIL_HOST_PASSWORD)

    def send_email(
        self,
        to: str | list[str],
        template_uuid: str,
        template_variables: dict,
    ) -> None:
        if not isinstance(to, list):
            to = [to]

        to_addresses = [Address(email=email) for email in to]

        mail = MailFromTemplate(
            sender=Address(email=self.sender_email, name=self.sender_name),
            to=to_addresses,
            template_uuid=template_uuid,
            template_variables={
                "app_name": settings.APP_NAME,
                **template_variables,
            },
        )

        self.client.send(mail)

    def bulk_send_emails(self, emails: list[dict]) -> None:
        for email_data in emails:
            to = email_data["to"]
            template_uuid = email_data["template_uuid"]
            template_variables = email_data["template_variables"]

            self.send_email(to, template_uuid, template_variables)
