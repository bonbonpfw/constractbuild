from dataclasses import asdict
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from DocConstructBe.data_model.models import (
    Document, Project, Proffsional, ProjectProfessional, ProjectDocument, Status,
    ProffsionalStatus, DocumentStatus, ProffsionalType
)
from database.database import db_session
import logging
from typing import List, Optional, Dict, Any

load_dotenv()

# Project API Functions
def api_project_create(project_data: Dict[str, Any]) -> Project:
    """Create a new project"""
    try:
        project = Project(
            project_name=project_data.get('project_name'),
            project_description=project_data.get('project_description'),
            project_address=project_data.get('project_address'),
            project_case_id=project_data.get('project_case_id'),
            project_due_date=project_data.get('project_due_date'),
            project_status=Status(project_data.get('project_status')),
            project_status_due_date=project_data.get('project_status_due_date')
        )
        db_session.add(project)
        db_session.commit()
        return project
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error creating project: {str(e)}")
        raise

def api_project_update(project_id: str, project_data: Dict[str, Any]) -> Project:
    """Update an existing project"""
    try:
        project = db_session.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found")
        
        for key, value in project_data.items():
            if hasattr(project, key):
                setattr(project, key, value)
        
        db_session.commit()
        return project
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error updating project: {str(e)}")
        raise

def api_project_delete(project_id: str) -> bool:
    """Delete a project and its related records"""
    try:
        project = db_session.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise ValueError(f"Project with ID {project_id} not found")
        
        # Delete related records first
        db_session.query(ProjectProfessional).filter(ProjectProfessional.project_id == project_id).delete()
        db_session.query(ProjectDocument).filter(ProjectDocument.project_id == project_id).delete()
        
        # Delete the project
        db_session.delete(project)
        db_session.commit()
        return True
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error deleting project: {str(e)}")
        raise

def api_project_get_all() -> List[Project]:
    """Get all projects"""
    try:
        return db_session.query(Project).all()
    except Exception as e:
        logging.error(f"Error getting all projects: {str(e)}")
        raise

def api_project_get_by_id(project_id: str) -> Optional[Project]:
    """Get project by ID"""
    try:
        return db_session.query(Project).filter(Project.project_id == project_id).first()
    except Exception as e:
        logging.error(f"Error getting project by ID: {str(e)}")
        raise

# Professional API Functions
def api_professional_create(professional_data: Dict[str, Any]) -> Proffsional:
    """Create a new professional"""
    try:
        professional = Proffsional(
            proffsional_name=professional_data.get('proffsional_name'),
            proffsional_email=professional_data.get('proffsional_email'),
            proffsional_phone=professional_data.get('proffsional_phone'),
            proffsional_address=professional_data.get('proffsional_address'),
            proffsional_license_number=professional_data.get('proffsional_license_number'),
            proffsional_license_expiration_date=professional_data.get('proffsional_license_expiration_date'),
            proffsional_type=ProffsionalType(professional_data.get('proffsional_type')),
            proffsional_status=ProffsionalStatus(professional_data.get('proffsional_status')),
            proffsional_national_id=professional_data.get('proffsional_national_id')
        )
        db_session.add(professional)
        db_session.commit()
        return professional
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error creating professional: {str(e)}")
        raise

def api_professional_update(professional_id: str, professional_data: Dict[str, Any]) -> Proffsional:
    """Update an existing professional"""
    try:
        professional = db_session.query(Proffsional).filter(Proffsional.proffsional_id == professional_id).first()
        if not professional:
            raise ValueError(f"Professional with ID {professional_id} not found")
        
        for key, value in professional_data.items():
            if hasattr(professional, key):
                setattr(professional, key, value)
        
        db_session.commit()
        return professional
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error updating professional: {str(e)}")
        raise

def api_professional_delete(professional_id: str) -> bool:
    """Delete a professional and their related records"""
    try:
        professional = db_session.query(Proffsional).filter(Proffsional.proffsional_id == professional_id).first()
        if not professional:
            raise ValueError(f"Professional with ID {professional_id} not found")
        
        # Delete related records first
        db_session.query(ProjectProfessional).filter(ProjectProfessional.professional_id == professional_id).delete()
        db_session.query(ProjectDocument).filter(ProjectDocument.professional_id == professional_id).delete()
        
        # Delete the professional
        db_session.delete(professional)
        db_session.commit()
        return True
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error deleting professional: {str(e)}")
        raise

def api_professional_get_all() -> List[Proffsional]:
    """Get all professionals"""
    try:
        return db_session.query(Proffsional).all()
    except Exception as e:
        logging.error(f"Error getting all professionals: {str(e)}")
        raise

def api_professional_get_by_id(professional_id: str) -> Optional[Proffsional]:
    """Get professional by ID"""
    try:
        return db_session.query(Proffsional).filter(Proffsional.proffsional_id == professional_id).first()
    except Exception as e:
        logging.error(f"Error getting professional by ID: {str(e)}")
        raise

# Document API Functions
def api_document_create(document_data: Dict[str, Any]) -> Document:
    """Create a new document"""
    try:
        document = Document(
            document_name=document_data.get('document_name'),
            document_type=document_data.get('document_type')
        )
        db_session.add(document)
        db_session.commit()
        return document
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error creating document: {str(e)}")
        raise

def api_document_delete(document_id: str) -> bool:
    """Delete a document and its related records"""
    try:
        document = db_session.query(Document).filter(Document.document_id == document_id).first()
        if not document:
            raise ValueError(f"Document with ID {document_id} not found")
        
        # Delete related records first
        db_session.query(ProjectDocument).filter(ProjectDocument.document_id == document_id).delete()
        
        # Delete the document
        db_session.delete(document)
        db_session.commit()
        return True
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error deleting document: {str(e)}")
        raise

def api_document_get_all(project_id: Optional[str] = None) -> List[Document]:
    """Get all documents, optionally filtered by project"""
    try:
        query = db_session.query(Document)
        if project_id:
            query = query.join(ProjectDocument).filter(ProjectDocument.project_id == project_id)
        return query.all()
    except Exception as e:
        logging.error(f"Error getting documents: {str(e)}")
        raise

def api_document_get_by_id(document_id: str) -> Optional[Document]:
    """Get document by ID"""
    try:
        return db_session.query(Document).filter(Document.document_id == document_id).first()
    except Exception as e:
        logging.error(f"Error getting document by ID: {str(e)}")
        raise

# Project-Professional Relationship API Functions
def api_project_add_professional(project_id: str, professional_id: str) -> ProjectProfessional:
    """Add a professional to a project"""
    try:
        # Check if relationship already exists
        existing = db_session.query(ProjectProfessional).filter(
            ProjectProfessional.project_id == project_id,
            ProjectProfessional.professional_id == professional_id
        ).first()
        
        if existing:
            raise ValueError("Professional is already associated with this project")
        
        project_professional = ProjectProfessional(
            project_id=project_id,
            professional_id=professional_id
        )
        db_session.add(project_professional)
        db_session.commit()
        return project_professional
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error adding professional to project: {str(e)}")
        raise

def api_project_remove_professional(project_id: str, professional_id: str) -> bool:
    """Remove a professional from a project"""
    try:
        project_professional = db_session.query(ProjectProfessional).filter(
            ProjectProfessional.project_id == project_id,
            ProjectProfessional.professional_id == professional_id
        ).first()
        
        if not project_professional:
            raise ValueError("Professional is not associated with this project")
        
        db_session.delete(project_professional)
        db_session.commit()
        return True
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error removing professional from project: {str(e)}")
        raise

# Project-Document Relationship API Functions
def api_project_add_document(project_id: str, document_id: str, professional_id: str) -> ProjectDocument:
    """Add a document to a project"""
    try:
        project_document = ProjectDocument(
            project_id=project_id,
            document_id=document_id,
            professional_id=professional_id,
            status=DocumentStatus.PENDING
        )
        db_session.add(project_document)
        db_session.commit()
        return project_document
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error adding document to project: {str(e)}")
        raise

def api_project_remove_document(project_id: str, document_id: str) -> bool:
    """Remove a document from a project"""
    try:
        project_document = db_session.query(ProjectDocument).filter(
            ProjectDocument.project_id == project_id,
            ProjectDocument.document_id == document_id
        ).first()
        
        if not project_document:
            raise ValueError("Document is not associated with this project")
        
        db_session.delete(project_document)
        db_session.commit()
        return True
    except Exception as e:
        db_session.rollback()
        logging.error(f"Error removing document from project: {str(e)}")
        raise

def extract_license_data_from_image(image_path: str) -> Dict[str, Any]:
    """Extract license data from an image"""
    try:
        # Implement license data extraction logic here
        pass
    except Exception as e:
        logging.error(f"Error extracting license data from image: {str(e)}")