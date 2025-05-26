import json
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
            ApiError.MESSAGE: params.get('error') if params else msg
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
            msg='Something went wrong',
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

class InvalidFileFormat(ApiError):
    def __init__(self,format:str):
        super().__init__(
            msg=f'Invalid file format: {format}',
            code='invalid_file_format'
        )


class ValidationError(ApiError):
    def __init__(self, params: dict):
        # Print validation error details explicitly for debugging
        if 'validation_errors' in params:
            print("ValidationError details:")
            for field, error in params['validation_errors'].items():
                print(f"  {field}: {error}")
                
        super().__init__(
            msg='Validation error',
            code='validation_error',
            params=params if params else None
        )

    def http_code(self):
        return HttpCodes.BAD_REQUEST


def handle_error(error: Exception):
    logging.error(f"Error occurred: {type(error)}")
    if isinstance(error, ValidationError):
        # For validation errors, make sure to log the details
        if hasattr(error, 'error_attributes') and error.error_attributes.get('error_params'):
            validation_errors = error.error_attributes.get('error_params').get('validation_errors', {})
            if validation_errors:
                logging.error("Validation errors details:")
                for field, msg in validation_errors.items():
                    logging.error(f"{field}: {msg}")
        error_response = ErrorResponse(api_error=error).generate_response()
    elif isinstance(error, ApiError):
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


# Project errors

class ProjectDoesNotExist(ApiError):
    def __init__(self):
        super().__init__(
            msg='Project not found',
            code='project_does_not_exist'
        )

    def http_code(self):
        return HttpCodes.NOT_FOUND


class ProjectAlreadyExists(ApiError):
    def __init__(self):
        super().__init__(
            msg='Project already exists',
            code='project_already_exists'
        )

    def http_code(self):
        return HttpCodes.BAD_REQUEST


class ProfessionalDoesNotExist(ApiError):
    def __init__(self):
        super().__init__(
            msg='Professional not found',
            code='professional_does_not_exist'
        )

    def http_code(self):
        return HttpCodes.NOT_FOUND


class ProfessionalAlreadyExists(ApiError):
    def __init__(self):
        super().__init__(
            msg='Professional already exists (Name, National ID or Email must be unique)',
            code='professional_already_exists'
        )

    def http_code(self):
        return HttpCodes.BAD_REQUEST

class ProfessionalAlreadyInProject(ApiError):
    def __init__(self):
        super().__init__(
            msg='Professional already in project',
            code='professional_already_in_project'
        )

    def http_code(self):
        return HttpCodes.BAD_REQUEST

class ProfessionalNotInProject(ApiError):
    def __init__(self):
        super().__init__(
            msg='Professional is not associated with this project',
            code='professional_not_in_project'
        )

    def http_code(self):
        return HttpCodes.BAD_REQUEST


class ProfessionalDocumentNotFound(ApiError):
    def __init__(self):
        super().__init__(
            msg='Document not found or not associated with this professional',
            code='professional_document_not_found'
        )

    def http_code(self):
        return HttpCodes.NOT_FOUND


class ProjectDocumentNotFound(ApiError):
    def __init__(self):
        super().__init__(
            msg='Document not found or not associated with this project',
            code='project_document_not_found'
        )

    def http_code(self):
        return HttpCodes.NOT_FOUND
