"""Application configuration settings."""

import os


def get_boolean_env_var(var_name: str, *, default: bool = False) -> bool:
    """Helper function to get boolean environment variables."""
    value = os.environ.get(var_name)
    if value is None:
        return default
    return value.lower() in {'true', '1', 't', 'y', 'yes'}


class FlaskAppConfiguration:
    """Configuration accessible via `app.config`.

    This configuration is also used by Flask extensions such as Flask-Mail.
    """

    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'localhost')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 25))
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_USE_TLS = get_boolean_env_var('MAIL_USE_TLS', default=False)
    MAIL_USE_SSL = get_boolean_env_var('MAIL_USE_SSL', default=False)

    MAIL_DEFAULT_SENDER_EMAIL = os.environ.get(
        "MAIL_DEFAULT_SENDER_EMAIL",
        "no-reply@test.com",
    )

    FILLED_PROJECT_DOCUMENTS_EMAIL_SUBJECT = os.environ.get(
        "FILLED_PROJECT_DOCUMENTS_EMAIL_SUBJECT",
        "Your Filled Project Documents",
    )
    FILLED_PROJECT_DOCUMENTS_EMAIL_BODY = os.environ.get(
        "FILLED_PROJECT_DOCUMENTS_EMAIL_BODY",
        "Please find attached filled project documents.",
    )
