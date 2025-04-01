import os
import json
import logging
import threading
from pathlib import Path
from datetime import datetime as dt
from flask import send_file, request, jsonify
from DocConstructBe.app.api import (
    api_project_create, api_project_update, api_project_delete,
    api_project_get_all, api_project_get_by_id,
    api_professional_create, api_professional_update, api_professional_delete,
    api_professional_get_all, api_professional_get_by_id,
    api_document_create, api_document_delete, api_document_get_all,
    api_document_get_by_id, api_project_add_professional,
    api_project_remove_professional, api_project_add_document,
    api_project_remove_document, extract_license_data_from_image
)
from app.response import SuccessResponse
from database.database import db_session
from DocConstructBe.data_model.models import DocumentStatus
from DocConstructBe.app.api_schema import API_ENDPOINTS

# Configure logging
logging.basicConfig(filename='statistics_test.log', level=logging.INFO, format='%(asctime)s %(message)s')

def validate_request(endpoint_name):
    """Validate request data against schema"""
    endpoint = API_ENDPOINTS.get(endpoint_name)
    if not endpoint:
        raise ValueError(f"Unknown endpoint: {endpoint_name}")
    
    if request.method != endpoint['method']:
        raise ValueError(f"Invalid method. Expected {endpoint['method']}")
    
    schema = endpoint['schema']()
    
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
        if 'file' in request.files:
            data['file'] = request.files['file']
    
    errors = schema.validate(data)
    if errors:
        raise ValueError(f"Validation error: {errors}")
    
    return schema.load(data)

def init_routes(app):
    ### Project Routes ###
    @app.route('/api/create_project', methods=['POST'])
    def create_new_project():
        try:
            data = validate_request('create_project')
            project = api_project_create(data)
            return SuccessResponse({
                'project_id': project.project_id,
                'project_name': project.project_name,
                'project_case_id': project.project_case_id
            }).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/update_project', methods=['POST'])
    def update_project():
        try:
            data = validate_request('update_project')
            project_id = data.pop('project_id')
            project = api_project_update(project_id, data)
            return SuccessResponse({
                'project_id': project.project_id,
                'project_name': project.project_name,
                'project_case_id': project.project_case_id
            }).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/delete_project', methods=['POST'])
    def delete_project():
        try:
            data = validate_request('delete_project')
            api_project_delete(data['project_id'])
            return SuccessResponse({'message': 'Project deleted successfully'}).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/projects', methods=['GET'])
    def retrieve_all_projects():
        try:
            projects = api_project_get_all()
            return SuccessResponse([{
                'project_id': project.project_id,
                'project_name': project.project_name,
                'project_case_id': project.project_case_id,
                'project_due_date': project.project_due_date.isoformat(),
                'project_status': project.project_status.value
            } for project in projects]).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/projects/<string:project_id>', methods=['GET'])
    def retrieve_project_by_id(project_id):
        try:
            data = validate_request('get_project')
            project = api_project_get_by_id(project_id)
            if not project:
                return jsonify({'error': 'Project not found'}), 404
            return SuccessResponse({
                'project_id': project.project_id,
                'project_name': project.project_name,
                'project_case_id': project.project_case_id,
                'project_due_date': project.project_due_date.isoformat(),
                'project_status': project.project_status.value,
                'project_description': project.project_description,
                'project_address': project.project_address,
                'project_docs_path': project.project_docs_path
            }).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    ### Professional Routes ###
    @app.route('/api/create_proffsional_from_file', methods=['POST'])
    def create_proffsional_from_file():
        try:
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400

            # Save the file temporarily
            temp_path = os.path.join('temp', file.filename)
            os.makedirs('temp', exist_ok=True)
            file.save(temp_path)

            # Extract license data from image
            license_data = extract_license_data_from_image(temp_path)
            
            # Validate the extracted data
            data = validate_request('create_professional')
            professional = api_professional_create(license_data)
            
            # Clean up temp file
            os.remove(temp_path)
            
            return SuccessResponse({
                'professional_id': professional.proffsional_id,
                'professional_name': professional.proffsional_name,
                'professional_type': professional.proffsional_type.value
            }).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/create_proffsional', methods=['POST'])
    def create_proffsional():
        try:
            data = validate_request('create_professional')
            professional = api_professional_create(data)
            return SuccessResponse({
                'professional_id': professional.proffsional_id,
                'professional_name': professional.proffsional_name,
                'professional_type': professional.proffsional_type.value
            }).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/update_proffsional', methods=['POST'])
    def update_proffsional():
        try:
            data = validate_request('update_professional')
            professional_id = data.pop('professional_id')
            professional = api_professional_update(professional_id, data)
            return SuccessResponse({
                'professional_id': professional.proffsional_id,
                'professional_name': professional.proffsional_name,
                'professional_type': professional.proffsional_type.value
            }).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/delete_proffsional', methods=['POST'])
    def delete_proffsional():
        try:
            data = validate_request('delete_professional')
            api_professional_delete(data['professional_id'])
            return SuccessResponse({'message': 'Professional deleted successfully'}).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/proffsionals', methods=['GET'])
    def retrieve_all_proffsionals():
        try:
            professionals = api_professional_get_all()
            return SuccessResponse([{
                'professional_id': prof.proffsional_id,
                'professional_name': prof.proffsional_name,
                'professional_type': prof.proffsional_type.value,
                'professional_status': prof.proffsional_status.value
            } for prof in professionals]).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/proffsionals/<string:professional_id>', methods=['GET'])
    def retrieve_proffsional_by_id(professional_id):
        try:
            data = validate_request('get_professional')
            professional = api_professional_get_by_id(professional_id)
            if not professional:
                return jsonify({'error': 'Professional not found'}), 404
            return SuccessResponse({
                'professional_id': professional.proffsional_id,
                'professional_name': professional.proffsional_name,
                'professional_email': professional.proffsional_email,
                'professional_phone': professional.proffsional_phone,
                'professional_address': professional.proffsional_address,
                'professional_license_number': professional.proffsional_license_number,
                'professional_license_expiration_date': professional.proffsional_license_expiration_date.isoformat(),
                'professional_type': professional.proffsional_type.value,
                'professional_status': professional.proffsional_status.value
            }).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    ### Document Routes ###
    @app.route('/api/documents/upload', methods=['POST'])
    def upload_document():
        try:
            data = validate_request('upload_document')
            
            # Create document record
            document_data = {
                'document_name': data['file'].filename,
                'document_type': data.get('document_type')
            }
            document = api_document_create(document_data)

            # Add document to project
            project_document = api_project_add_document(
                project_id=data['project_id'],
                document_id=document.document_id,
                professional_id=data['professional_id']
            )

            # Save file
            file_path = os.path.join('documents', str(project_document.project_document_id))
            os.makedirs('documents', exist_ok=True)
            data['file'].save(file_path)

            return SuccessResponse({
                'document_id': document.document_id,
                'document_name': document.document_name,
                'document_type': document.document_type.value,
                'status': project_document.status.value
            }).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/documents/download/<string:document_id>', methods=['GET'])
    def download_document(document_id):
        try:
            data = validate_request('get_document')
            document = api_document_get_by_id(document_id)
            if not document:
                return jsonify({'error': 'Document not found'}), 404

            project_document = document.project_documents[0]  # Get first project document
            file_path = os.path.join('documents', str(project_document.project_document_id))
            
            if not os.path.exists(file_path):
                return jsonify({'error': 'File not found'}), 404

            return send_file(
                file_path,
                as_attachment=True,
                download_name=document.document_name
            )
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/documents/delete', methods=['DELETE'])
    def delete_document():
        try:
            data = validate_request('delete_document')
            api_project_remove_document(data['project_id'], data['document_id'])
            api_document_delete(data['document_id'])
            return SuccessResponse({'message': 'Document deleted successfully'}).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/documents', methods=['GET'])
    def retrieve_all_documents():
        try:
            project_id = request.args.get('project_id')
            documents = api_document_get_all(project_id)
            return SuccessResponse([{
                'document_id': doc.document_id,
                'document_name': doc.document_name,
                'document_type': doc.document_type.value,
                'created_at': doc.created_at.isoformat()
            } for doc in documents]).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    ### Relations Routes ###
    @app.route('/api/project/add_proffsional_to_project', methods=['POST'])
    def add_proffsional_to_project():
        try:
            data = validate_request('add_professional_to_project')
            project_professional = api_project_add_professional(
                data['project_id'], 
                data['professional_id']
            )
            return SuccessResponse({
                'project_id': project_professional.project_id,
                'professional_id': project_professional.professional_id
            }).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/project/remove_proffsional_from_project', methods=['POST'])
    def remove_proffsional_from_project():
        try:
            data = validate_request('remove_professional_from_project')
            api_project_remove_professional(
                data['project_id'], 
                data['professional_id']
            )
            return SuccessResponse({'message': 'Professional removed from project successfully'}).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/document/get_document_type/<string:document_id>', methods=['GET'])
    def get_document_type(document_id):
        try:
            data = validate_request('get_document')
            document = api_document_get_by_id(document_id)
            if not document:
                return jsonify({'error': 'Document not found'}), 404
            return SuccessResponse({
                'document_id': document.document_id,
                'document_type': document.document_type.value
            }).generate_response()
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    