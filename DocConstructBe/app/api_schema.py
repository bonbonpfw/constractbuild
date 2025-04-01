from marshmallow import Schema, fields, validate
from datetime import date
from DocConstructBe.data_model.models import (
    Status, DocumentType, ProffsionalType, 
    ProffsionalStatus, DocumentStatus
)

# Project Schemas
class ProjectCreateSchema(Schema):
    project_name = fields.Str(required=True, validate=validate.Length(min=1))
    project_description = fields.Str(allow_none=True)
    project_address = fields.Str(required=True)
    project_case_id = fields.Str(allow_none=True)
    project_due_date = fields.Date(allow_none=True)
    project_status = fields.Enum(Status, required=True)
    project_status_due_date = fields.Date(allow_none=True)
    project_docs_path = fields.Str(allow_none=True)

class ProjectUpdateSchema(Schema):
    project_id = fields.UUID(required=True)
    project_name = fields.Str(validate=validate.Length(min=1))
    project_description = fields.Str(allow_none=True)
    project_address = fields.Str()
    project_case_id = fields.Str()
    project_due_date = fields.Date()
    project_status = fields.Enum(Status)
    project_status_due_date = fields.Date()
    project_docs_path = fields.Str()

class ProjectDeleteSchema(Schema):
    project_id = fields.UUID(required=True)

class ProjectGetSchema(Schema):
    project_id = fields.UUID(required=True)

# Professional Schemas
class ProfessionalCreateSchema(Schema):
    proffsional_name = fields.Str(required=True)
    proffsional_email = fields.Email(required=True)
    proffsional_phone = fields.Str(required=True, validate=validate.Length(min=9, max=15))
    proffsional_address = fields.Str(required=True)
    proffsional_license_number = fields.Str(required=True)
    proffsional_license_expiration_date = fields.Date(required=True)
    proffsional_type = fields.Enum(ProffsionalType, required=True)
    proffsional_status = fields.Enum(ProffsionalStatus, required=True)
    proffsional_national_id = fields.Str(required=True)

class ProfessionalUpdateSchema(Schema):
    proffsional_id = fields.UUID(required=True)
    proffsional_name = fields.Str()
    proffsional_email = fields.Email()
    proffsional_phone = fields.Str(validate=validate.Length(min=9, max=15))
    proffsional_address = fields.Str()
    proffsional_license_number = fields.Str()
    proffsional_license_expiration_date = fields.Date()
    proffsional_type = fields.Enum(ProffsionalType)
    proffsional_status = fields.Enum(ProffsionalStatus)
    proffsional_national_id = fields.Str()

class ProfessionalDeleteSchema(Schema):
    proffsional_id = fields.UUID(required=True)

class ProfessionalGetSchema(Schema):
    proffsional_id = fields.UUID(required=True)

# Document Schemas
class DocumentCreateSchema(Schema):
    document_name = fields.Str(required=True)
    document_type = fields.Enum(DocumentType, required=True)

class DocumentDeleteSchema(Schema):
    document_id = fields.UUID(required=True)

class DocumentGetSchema(Schema):
    document_id = fields.UUID(required=True)

class DocumentUploadSchema(Schema):
    project_id = fields.UUID(required=True)
    document_id = fields.UUID(required=True)
    professional_id = fields.UUID(required=True)
    file = fields.Raw(required=True)

# Project-Professional Relationship Schemas
class ProjectProfessionalAddSchema(Schema):
    project_id = fields.UUID(required=True)
    professional_id = fields.UUID(required=True)

class ProjectProfessionalRemoveSchema(Schema):
    project_id = fields.UUID(required=True)
    professional_id = fields.UUID(required=True)

# Project-Document Relationship Schemas
class ProjectDocumentAddSchema(Schema):
    project_id = fields.UUID(required=True)
    document_id = fields.UUID(required=True)
    professional_id = fields.UUID(required=True)

class ProjectDocumentRemoveSchema(Schema):
    project_id = fields.UUID(required=True)
    document_id = fields.UUID(required=True)

# API Endpoint Definitions
API_ENDPOINTS = {
    'create_project': {
        'method': 'POST',
        'schema': ProjectCreateSchema,
        'description': 'Create a new project'
    },
    'update_project': {
        'method': 'POST',
        'schema': ProjectUpdateSchema,
        'description': 'Update an existing project'
    },
    'delete_project': {
        'method': 'POST',
        'schema': ProjectDeleteSchema,
        'description': 'Delete a project'
    },
    'get_project': {
        'method': 'GET',
        'schema': ProjectGetSchema,
        'description': 'Get project by ID'
    },
    'create_professional': {
        'method': 'POST',
        'schema': ProfessionalCreateSchema,
        'description': 'Create a new professional'
    },
    'update_professional': {
        'method': 'POST',
        'schema': ProfessionalUpdateSchema,
        'description': 'Update an existing professional'
    },
    'delete_professional': {
        'method': 'POST',
        'schema': ProfessionalDeleteSchema,
        'description': 'Delete a professional'
    },
    'get_professional': {
        'method': 'GET',
        'schema': ProfessionalGetSchema,
        'description': 'Get professional by ID'
    },
    'create_document': {
        'method': 'POST',
        'schema': DocumentCreateSchema,
        'description': 'Create a new document'
    },
    'delete_document': {
        'method': 'DELETE',
        'schema': DocumentDeleteSchema,
        'description': 'Delete a document'
    },
    'get_document': {
        'method': 'GET',
        'schema': DocumentGetSchema,
        'description': 'Get document by ID'
    },
    'upload_document': {
        'method': 'POST',
        'schema': DocumentUploadSchema,
        'description': 'Upload a document to a project'
    },
    'add_professional_to_project': {
        'method': 'POST',
        'schema': ProjectProfessionalAddSchema,
        'description': 'Add a professional to a project'
    },
    'remove_professional_from_project': {
        'method': 'POST',
        'schema': ProjectProfessionalRemoveSchema,
        'description': 'Remove a professional from a project'
    },
    'add_document_to_project': {
        'method': 'POST',
        'schema': ProjectDocumentAddSchema,
        'description': 'Add a document to a project'
    },
    'remove_document_from_project': {
        'method': 'POST',
        'schema': ProjectDocumentRemoveSchema,
        'description': 'Remove a document from a project'
    }
} 