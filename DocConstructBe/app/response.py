import json
from datetime import date, datetime, timezone
from enum import Enum

import flask

from app.http_codes import HttpCodes


class ApiJsonResponseEncoder(json.JSONEncoder):
    def __init__(self):
        super().__init__()

    def default(self, o):
        if isinstance(o, datetime):
            return o.replace(tzinfo=timezone.utc).isoformat()
        if isinstance(o, date):
            return o.isoformat()
        if isinstance(o, Enum):
            return o.value
        return json.JSONEncoder.default(self, o)


class ApiResponse(object):
    def __init__(self, http_code: int, response_code: str, additional_info: dict = None):
        self.http_code = http_code
        self._response_dict = {'status_code': response_code}
        self._response_dict.update(additional_info or {})

    def generate_response(self, json_encoder=None):
        if json_encoder is None:
            json_encoder = ApiJsonResponseEncoder()
        response = flask.json.jsonify(json.loads(json_encoder.encode(self._response_dict)))
        response.status_code = self.http_code
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        return response


class SuccessResponse(ApiResponse):
    def __init__(self, additional_info=None, http_code=HttpCodes.OK):
        super().__init__(
            http_code=http_code,
            response_code='success',
            additional_info=additional_info
        )


class ErrorResponse(ApiResponse):
    def __init__(self, api_error):
        super().__init__(
            http_code=api_error.http_code(),
            response_code=api_error.ERROR_CODE,
            additional_info=api_error.get_dict()
        )
