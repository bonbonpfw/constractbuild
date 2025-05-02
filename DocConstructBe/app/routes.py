import os
import tempfile
import mimetypes

from flask import send_file, request, jsonify

from app.errors import ValidationError
from app.api import (
    ProjectManager, ProfessionalManager
)
from app.response import SuccessResponse
from app.api_schema import API_ENDPOINTS, Endpoints



def validate_request(endpoint):
    """Validate request data against schema"""
    endpoint = API_ENDPOINTS.get(endpoint)
    if not endpoint:
        raise ValidationError(params={"unknown_endpoint": endpoint})

    if request.method != endpoint['method']:
        raise ValidationError(
            params={
                "invalid_method": request.method,
                "expected_method": endpoint['method']
            }
        )

    schema = endpoint['schema']()

    if request.is_json:
        data = request.get_json()
        print('JSON data:', data)
        if 'status_code' in data:
            del data['status_code']
    elif request.method in ['GET', 'DELETE']:
        data = request.args.to_dict()
        print('GET data:', data)
    else:
        data = request.form.to_dict()
        print('Form data:', data)
        print('Files:', request.files)
        if 'file' in request.files:
            data['file'] = request.files['file']

    errors = schema.validate(data)
    if errors:
        raise ValidationError(params={"error": errors})

    return schema.load(data)


def init_routes(app):
    ### Projects ###
    @app.route('/api/projects', methods=['GET'])
    def get_projects():
        validate_request(endpoint=Endpoints.GET_PROJECTS)
        projects = ProjectManager().get_all()
        return SuccessResponse({
            'projects': [{
                'id': project.id,
                'name': project.name,
                'case_id': project.case_id,
                'status': project.status,
                'address': project.address,
                'due_date': project.due_date.isoformat(),
            } for project in projects]
        }).generate_response()

    @app.route('/api/project', methods=['GET'])
    def get_project():
        data = validate_request(endpoint=Endpoints.GET_PROJECT)
        project = ProjectManager().get_by_id(project_id=str(data['project_id']))
        return SuccessResponse({
            'project': {
                'id': project.id,
                'name': project.name,
                'case_id': project.case_id,
                'due_date': project.due_date.isoformat() if project.due_date else None,
                'status': project.status,
                'description': project.description,
                'address': project.address,
                'status_due_date': project.status_due_date.isoformat() if project.status_due_date else None,
                'professionals': [{
                    'id': prof.professional_id,
                    'name': prof.professional.name,
                    'email': prof.professional.email,
                    'professional_type': prof.professional.professional_type,
                    'status': prof.professional.status
                } for prof in project.professionals],
                'documents': [{
                    'id': doc.id,
                    'name': doc.name,
                    'document_type': doc.document_type,
                    'status': doc.status,
                    'created_at': doc.created_at.isoformat(),
                } for doc in project.documents]
            }
        }).generate_response()

    @app.route('/api/project', methods=['POST'])
    def create_project():
        data = validate_request(endpoint=Endpoints.CREATE_PROJECT)
        project = ProjectManager().create(
            name=data['name'],
            case_id=data['case_id'],
            address=data['address'],
            description=data.get('description'),
            due_date=data.get('due_date'),
            status=data.get('status'),
            status_due_date=data.get('status_due_date'),
        )
        return SuccessResponse({'id': project.id}).generate_response()

    @app.route('/api/project', methods=['PUT'])
    def update_project():
        data = validate_request(endpoint=Endpoints.UPDATE_PROJECT)
        ProjectManager().update(
            project_id=str(data['id']),
            name=data['name'],
            case_id=data['case_id'],
            address=data['address'],
            description=data.get('description'),
            due_date=data.get('due_date'),
            status=data['status'].value if data.get('status') else None,
            status_due_date=data.get('status_due_date'),
        )
        return SuccessResponse().generate_response()

    @app.route('/api/project', methods=['DELETE'])
    def delete_project():
        data = validate_request(endpoint=Endpoints.DELETE_PROJECT)
        ProjectManager().delete(project_id=str(data['project_id']))
        return SuccessResponse().generate_response()

    @app.route('/api/project/statuses', methods=['GET'])
    def get_project_statuses():
        validate_request(endpoint=Endpoints.GET_PROJECT_STATUSES)
        return SuccessResponse({
            'statuses': ProjectManager().get_statuses()
        }).generate_response()

    @app.route('/api/project/professionals', methods=['POST'])
    def add_professional_to_project():
        data = validate_request(Endpoints.ADD_PROJECT_PROFESSIONAL)
        project_professional = ProjectManager().attach_professional(
            str(data['project_id']),
            str(data['professional_id'])
        )
        return SuccessResponse({
            'id': project_professional.id,
            'project_id': project_professional.project_id,
            'professional_id': project_professional.professional_id
        }).generate_response()

    @app.route('/api/project/professionals', methods=['DELETE'])
    def remove_professional_from_project():
        data = validate_request(Endpoints.REMOVE_PROJECT_PROFESSIONAL)
        ProjectManager().detach_professional(
            str(data['project_id']),
            str(data['professional_id'])
        )
        return SuccessResponse().generate_response()

    @app.route('/api/project/document', methods=['GET'])
    def download_project_document():
        data = validate_request(endpoint=Endpoints.DOWNLOAD_PROJECT_DOCUMENT)
        project_document = ProjectManager().get_document(
            project_id=str(data['project_id']),
            document_id=str(data['document_id'])
        )
        return send_file(
            project_document.file_path,
            as_attachment=True,
            download_name=project_document.name
        )

    @app.route('/api/project/document', methods=['POST'])
    def upload_project_document():
        data = validate_request(endpoint=Endpoints.UPLOAD_PROJECT_DOCUMENT)
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = os.path.join(tmpdir, data['file'].filename)
            data['file'].save(file_path)
            data['file_path'] = file_path
            project_document = ProjectManager().add_document(
                file_path=data.get('file_path', ''),
                project_id=str(data['project_id']),
                document_type=data['document_type'].value,
                document_name=data['document_name']
            )
        return SuccessResponse({
            'id': project_document.id,
            'project_id': project_document.project_id
        }).generate_response()

    @app.route('/api/project/document', methods=['DELETE'])
    def delete_project_document():
        data = validate_request(endpoint=Endpoints.REMOVE_PROJECT_DOCUMENT)
        ProjectManager().remove_document(
            project_id=str(data['project_id']),
            document_id=str(data['document_id'])
        )
        return SuccessResponse().generate_response()

    @app.route('/api/project/document/types', methods=['GET'])
    def get_project_document_types():
        validate_request(endpoint=Endpoints.GET_PROJECT_DOCUMENT_TYPES)
        return SuccessResponse({
            'document_types': ProjectManager().get_document_types()
        }).generate_response()

    ### Professionals ###
    @app.route('/api/professionals', methods=['GET'])
    def get_professionals():
        validate_request(endpoint=Endpoints.GET_PROFESSIONALS)
        professionals = ProfessionalManager.get_all()
        return SuccessResponse({
            'professionals': [{
                'id': prof.id,
                'name': prof.name,
                'email': prof.email,
                'professional_type': prof.professional_type,
                'status': prof.status,
            } for prof in professionals]
        }).generate_response()

    @app.route('/api/professional', methods=['GET'])
    def get_professional():
        data = validate_request(endpoint=Endpoints.GET_PROFESSIONAL)
        professional = ProfessionalManager.get_by_id(professional_id=str(data['professional_id']))
        return SuccessResponse({
            'professional': {
                'id': professional.id,
                'name': professional.name,
                'national_id': professional.national_id,
                'email': professional.email,
                'phone': professional.phone,
                'address': professional.address,
                'license_number': professional.license_number,
                'license_expiration_date': professional.license_expiration_date.isoformat(),
                'professional_type': professional.professional_type,
                'status': professional.status,
                'license_file_path': professional.license_file_path,
                'documents': [{
                    'id': doc.id,
                    'name': doc.name,
                    'document_type': doc.document_type,
                    'status': doc.status,
                    'created_at': doc.created_at.isoformat(),
                } for doc in professional.documents]
            }
        }).generate_response()

    @app.route('/api/professional', methods=['POST'])
    def create_professional():
        data = validate_request(endpoint=Endpoints.CREATE_PROFESSIONAL)
        
        # Create the professional
        professional = ProfessionalManager.create(
            name=data['name'],
            national_id=data['national_id'],
            email=data['email'],
            phone=data['phone'],
            address=data['address'],
            license_number=data['license_number'],
            license_expiration_date=data['license_expiration_date'],
            professional_type=data['professional_type'].value,
            # license_file_path is now optional and will be handled as a document
            license_file_path=data.get('license_file_path')
        )
        
        return SuccessResponse({'id': professional.id}).generate_response()

    @app.route('/api/professional/import', methods=['POST'])
    def import_professional_data():
        data = validate_request(endpoint=Endpoints.IMPORT_PROFESSIONAL_FILE)
        file = data.get('file')
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, file.filename)
        file.save(temp_path)
        
        # Extract data from the license file
        # Note: license_file_path is included for backward compatibility
        # but license files are now handled as LICENSE document type
        license_data = ProfessionalManager().extract_professional_data(temp_path)
        
        return SuccessResponse(license_data).generate_response()

    @app.route('/api/professional', methods=['PUT'])
    def update_professional():
        data = validate_request(endpoint=Endpoints.UPDATE_PROFESSIONAL)
        ProfessionalManager().update(
            professional_id=str(data['id']),
            name=data['name'],
            national_id=data['national_id'],
            email=data['email'],
            phone=data['phone'],
            address=data['address'],
            license_number=data['license_number'],
            license_expiration_date=data['license_expiration_date'],
            professional_type=data['professional_type'].value,
            status=data['status'].value
        )
        return SuccessResponse().generate_response()

    @app.route('/api/professional', methods=['DELETE'])
    def delete_professional():
        data = validate_request(endpoint=Endpoints.DELETE_PROFESSIONAL)
        ProfessionalManager().delete(professional_id=str(data['professional_id']))
        return SuccessResponse().generate_response()

    @app.route('/api/professional/types', methods=['GET'])
    def get_professional_types():
        validate_request(endpoint=Endpoints.GET_PROFESSIONAL_TYPES)
        return SuccessResponse({'types': ProfessionalManager().get_types()}).generate_response()

    @app.route('/api/professional/statuses', methods=['GET'])
    def get_professional_statuses():
        validate_request(endpoint=Endpoints.GET_PROFESSIONAL_STATUSES)
        return SuccessResponse({'statuses': ProfessionalManager().get_statuses()}).generate_response()

    @app.route('/api/professional/document', methods=['GET'])
    def download_professional_document():
        data = validate_request(endpoint=Endpoints.DOWNLOAD_PROFESSIONAL_DOCUMENT)
        professional_document = ProfessionalManager().get_document(
            professional_id=str(data['professional_id']),
            document_id=str(data['document_id'])
        )
        return send_file(
            professional_document.file_path,
            as_attachment=True,
            download_name=professional_document.name
        )

    @app.route('/api/professional/document', methods=['POST'])
    def add_professional_document():
        data = validate_request(endpoint=Endpoints.ADD_PROFESSIONAL_DOCUMENT)
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = os.path.join(tmpdir, data['file'].filename)
            data['file'].save(file_path)
            data['file_path'] = file_path
            professional_document = ProfessionalManager().add_document(
                file_path=data.get('file_path', ''),
                professional_id=str(data['professional_id']),
                document_type=data['document_type'].value,
                document_name=data['document_name']
            )
        return SuccessResponse({
            'id': professional_document.id,
            'professional_id': professional_document.professional_id
        }).generate_response()

    @app.route('/api/professional/document', methods=['DELETE'])
    def remove_professional_document():
        data = validate_request(endpoint=Endpoints.REMOVE_PROFESSIONAL_DOCUMENT)
        ProfessionalManager().remove_document(
            professional_id=str(data['professional_id']),
            document_id=str(data['document_id'])
        )
        return SuccessResponse().generate_response()

    @app.route('/api/professional/document/types', methods=['GET'])
    def get_professional_document_types():
        validate_request(endpoint=Endpoints.GET_PROFESSIONAL_DOCUMENT_TYPES)
        return SuccessResponse({
            'document_types': ProfessionalManager().get_document_types()
        }).generate_response()
    