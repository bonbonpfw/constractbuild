import logging

import werkzeug

from app.http_codes import HttpCodes
from app.response import ErrorResponse


class ApiError(Exception):
    ERROR_CODE = 'error_code'
    MESSAGE = 'error_message'
    ERROR_PARAMS = 'error_params'

    def __init__(self, msg, code, params=None):
        self.error_attributes = {
            ApiError.ERROR_CODE: code,
            ApiError.MESSAGE: msg.format(**params) if params else msg
        }
        if params:
            self.error_attributes[ApiError.ERROR_PARAMS] = params

    def get_dict(self):
        return self.error_attributes

    def http_code(self):
        return HttpCodes.BAD_REQUEST


class InternalServerError(ApiError):
    def __init__(self):
        super().__init__(
            msg='Internal server error',
            code='internal_server_error'
        )

    def http_code(self):
        return HttpCodes.SERVER_INTERNAL_ERROR


class GeneralClientException(ApiError):
    def __init__(self, msg, code, params=None):
        super().__init__(msg, code, params)


class HttpException(ApiError):
    def __init__(self, http_code, message):
        super().__init__(
            msg=message,
            code='http_error'
        )
        self.m_http_code = http_code

    def http_code(self):
        return self.m_http_code


class RequestParametersError(ApiError):
    def __init__(self, fields_names_messages_dict):
        super().__init__(
            msg="Invalid parameters",
            code="invalid_params",
            params={'fields_errors': fields_names_messages_dict}
        )

    def allocate_error_msg(self, fields_names_messages_dict):
        final_res = {}
        for field_name, val in fields_names_messages_dict.items():
            if isinstance(val, str):
                final_res[field_name] = {'message': val}
            else:
                final_res[field_name] = self.allocate_error_msg(val)
        return final_res


class InvalidAttachedJson(ApiError):
    def __init__(self, error: str):
        super().__init__(
            msg='Invalid attached JSON file: {error}',
            code='invalid_attached_json',
            params={"error": error}
        )


def handle_error(error: Exception):
    logging.error(f"Error occurred: {type(error)}")
    if isinstance(error, ApiError):
        error_response = ErrorResponse(api_error=error).generate_response()
    elif isinstance(error, werkzeug.exceptions.HTTPException):
        error: werkzeug.exceptions.HTTPException
        error_response = ErrorResponse(api_error=HttpException(
            http_code=error.code,
            message=error.description
        )).generate_response()
    else:
        logging.exception(error, exc_info=True)
        error_response = ErrorResponse(api_error=InternalServerError()).generate_response()

    return error_response


# Survey errors

class SurveyDoesNotExist(ApiError):
    def __init__(self):
        super().__init__(
            msg='Survey does not exist',
            code='survey_does_not_exist'
        )

    def http_code(self):
        return HttpCodes.NOT_FOUND
