import datetime
from datetime import date, timedelta
import os
import shutil
import tempfile
import mimetypes
from config.sys_config import DOCUMENTS_FOLDER
from utils.data_extract import ExtractProfessional
from utils.doc_to_bin import process_pdf_image_to_binary,process_image_to_binary,process_pdf_to_binary
from doc_map.doc_map import DocumentMap
from app.errors import (
    ProjectDoesNotExist,
    ProjectAlreadyExists,
    ProfessionalDoesNotExist,
    ProfessionalAlreadyExists,
    ProfessionalAlreadyInProject,
    ProfessionalNotInProject,
    ProfessionalDocumentNotFound,
    ProjectDocumentNotFound,
    InvalidDocumentStatus
)
from data_model.models import (
    Project,
    Professional,
    ProjectProfessional,
    ProjectDocument,
    ProfessionalDocument,
    ProjectTeamMember,
)
from database.database import db_session
from data_model.enum import (
    ProjectStatus,
    ProfessionalStatus,
    ProfessionalType,
    ProfessionalDocumentType,
    ProjectDocumentType,
    enum_to_value,
    DocumentStatus,
    ProjectTeamRole,
    
)
from doc_map.doc_map import DocumentFiller
from app.errors import InvalidFileFormat


class ProjectManager:
    @staticmethod
    def get_all() -> list[Project]:
        from sqlalchemy.orm import joinedload
        return db_session.query(Project).options(joinedload(Project.team_members)).all()

    @staticmethod
    def get_by_id(project_id: str) -> Project:
        project = db_session.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ProjectDoesNotExist()
        return project

    @staticmethod
    def create(name: str,  request_number: str, status: ProjectStatus, description: str = None,
               status_due_date: date = None) -> Project:
        existing_project = db_session.query(Project).filter(
            (Project.name == name) | (Project.request_number == request_number)
        ).first()
        if existing_project:
            raise ProjectAlreadyExists()
        project = Project(
            name=name,
            request_number=request_number,
            description=description,
            status=enum_to_value(status),
            status_due_date=status_due_date,
        )
        project.created_at = project.updated_at = datetime.datetime.now()
        db_session.add(project)
        db_session.commit()
        return project

    def update(self, project_id: str, name: str, status: ProjectStatus, description: str = None,
               status_due_date: date = None, request_number: str = None, construction_supervision_number: str = None, engineering_coordinator_number: str = None, firefighting_number: str = None) -> Project:
        project = self.get_by_id(project_id=project_id)
        project.name = name
        project.description = description
        project.request_number = request_number
        project.construction_supervision_number = construction_supervision_number
        project.engineering_coordinator_number = engineering_coordinator_number
        project.firefighting_number = firefighting_number
        project.status = enum_to_value(status)
        project.status_due_date = status_due_date
        project.updated_at = datetime.datetime.now()
        db_session.commit()
        return project

    def delete(self, project_id: str) -> None:
        project = self.get_by_id(project_id=project_id)
        db_session.delete(project)
        db_session.commit()

    @staticmethod
    def get_statuses() -> list[str]:
        return [status.value for status in ProjectStatus]

    def attach_professional(self, project_id: str, professional_id: str) -> ProjectProfessional:
        project = self.get_by_id(project_id=project_id)
        professional = ProfessionalManager().get_by_id(professional_id=professional_id)
        # Check if a relationship already exists
        existing = db_session.query(ProjectProfessional).filter(
            ProjectProfessional.project_id == project.id,
            ProjectProfessional.professional_id == professional.id
        ).first()
        if existing:
            raise ProfessionalAlreadyInProject()
        project_professional = ProjectProfessional(
            project_id=project_id,
            professional_id=professional_id,
            created_at=datetime.datetime.now(),
        )
        db_session.add(project_professional)
        db_session.commit()
        return project_professional

    @staticmethod
    def detach_professional(project_id: str, professional_id: str) -> None:
        project_professional = db_session.query(ProjectProfessional).filter(
            ProjectProfessional.project_id == project_id,
            ProjectProfessional.professional_id == professional_id
        ).first()

        if not project_professional:
            raise ProfessionalNotInProject()

        db_session.delete(project_professional)
        db_session.commit()

    @staticmethod
    def get_document(project_id: str, document_id: str) -> ProjectDocument:
        document = db_session.query(ProjectDocument).filter(
            ProjectDocument.id == document_id,
            ProjectDocument.project_id == project_id
        ).first()
        if not document:
            raise ProjectDocumentNotFound()
        return document

    def add_document(self, file_path: str, project_id: str, document_type: str,
                     document_name: str, document_status: DocumentStatus) -> ProjectDocument:
        self.get_by_id(project_id=project_id)
        # Create projects documents directory if it doesn't exist
        projects_dir = os.path.join(DOCUMENTS_FOLDER, 'projects')
        if not os.path.exists(projects_dir):
            os.makedirs(projects_dir, exist_ok=True)
        # Create directory for this project if it doesn't exist
        project_dir = os.path.join(projects_dir, project_id)
        if not os.path.exists(project_dir):
            os.makedirs(project_dir, exist_ok=True)
        # Generate a unique filename
        filename = f"{document_type}_{document_name}"
        dest_path = os.path.join(project_dir, filename)
        # Copy the file to the destination
        if os.path.exists(file_path):
            shutil.copy2(file_path, dest_path)

        try:
          status = document_status.value if hasattr(document_status, 'value') else document_status
        except KeyError:
            raise InvalidDocumentStatus(document_status=document_status)
        # Create a document record in the database
        document = ProjectDocument(
            project_id=project_id,
            document_type=enum_to_value(document_type),
            name=document_name,
            file_path=dest_path,
            status=status,
            created_at=datetime.datetime.now(),
        )
        db_session.add(document)
        db_session.commit()
        return document

    @staticmethod
    def get_project_professionals(project_id: str) -> list[Professional]:
        return db_session.query(Professional).join(
            ProjectProfessional, Professional.id == ProjectProfessional.professional_id
        ).filter(ProjectProfessional.project_id == project_id).all()
    
    @staticmethod
    def remove_document(project_id: str, document_id: str) -> None:
        document = db_session.query(ProjectDocument).filter(
            ProjectDocument.id == document_id,
            ProjectDocument.project_id == project_id
        ).first()
        if not document:
            raise ProjectDocumentNotFound()
        # Remove the file from the filesystem if it exists
        if document.file_path and os.path.exists(document.file_path):
            try:
                os.remove(document.file_path)
            except OSError as e:
                # Log the error but continue with database deletion
                import logging
                logging.error(f"Error removing file {document.file_path}: {e}")
        # Remove the document record from the database
        db_session.delete(document)
        db_session.commit()

    @staticmethod
    def get_document_types() -> list[str]:
        return [document_type.value for document_type in ProjectDocumentType]
    
    @staticmethod
    def get_document_statuses() -> list[str]:
        return [status.value for status in DocumentStatus]


class ProjectDocumentManager:

    @staticmethod
    def get_document_project_professionals(project_id: str, document_type: ProjectDocumentType):
        professionals = []
        doc_professionals = DocumentMap.DOCUMENT_PROFESSIONAL_MAP.get(document_type.name, [])
        doc_professionals_types = [professional.value for professional in doc_professionals]
        project_professionals = db_session.query(ProjectProfessional).filter(ProjectProfessional.project_id == project_id).all()
        for project_professional in project_professionals:
            professional = db_session.query(Professional).filter(Professional.id == project_professional.professional_id).first()
            if professional.professional_type in doc_professionals_types:
                professionals.append(professional)
        return professionals
    
    @staticmethod
    def get_document_professionals_names(document_type: ProjectDocumentType):
        doc_professionals_types = DocumentMap.DOCUMENT_PROFESSIONAL_MAP.get(document_type.name, [])
        return doc_professionals_types
  
    
    @staticmethod
    def get_document_professionals(document_type: ProjectDocumentType,professionals: list[Professional]):
        doc_professionals_types = ProjectDocumentManager.get_document_professionals_names(document_type)
        document_professionals = []
        for professional in professionals:
            prof_name = ProfessionalManager.get_prof_name(professional.professional_type)
            if prof_name in doc_professionals_types:
                document_professionals.append(professional)
        return document_professionals

    @staticmethod
    def autofill_document(document_type: ProjectDocumentType, professionals: list[Professional],team_members: list[ProjectTeamMember], src_pdf_path: str, project_id: str):
        for professional in professionals:
            professional.role =ProfessionalManager.get_role(professional.professional_type)
        document_filler = DocumentFiller(
            document_type=document_type,
            professionals=professionals,
            src_pdf_path=src_pdf_path,
            team_members=team_members
        )
        filled_pdf_path = document_filler.fill_document()
        return filled_pdf_path


class ProfessionalManager:
    @staticmethod
    def get_types() -> list[str]:
        return [professional_type for professional_type in ProfessionalType]

    @staticmethod
    def get_role(prof_value: str) -> str:
        return next((professional_type for professional_type in ProfessionalType if professional_type.value == prof_value), None)
    @staticmethod
    def get_statuses() -> list[str]:
        return [status.value for status in ProfessionalStatus]

    @staticmethod
    def get_prof_name(prof_value: str) -> ProfessionalType:
        return ProfessionalType.map_to_value(prof_value).name
    
    @staticmethod
    def get_prof_value(prof_name: str) -> str:
        types = ProfessionalManager.get_types() 
        for type in types:
            if prof_name == type.name:
                return type.value
        return None
    
    @staticmethod
    def get_all() -> list[Professional]:
        professionals = db_session.query(Professional).all()
        for professional in professionals:
            professional.status = ProfessionalManager.get_professional_status(professional.license_expiration_date).value
        return professionals

    @staticmethod
    def get_by_id(professional_id: str) -> Professional:
        professional = db_session.query(Professional).filter(Professional.id == professional_id).first()
        if not professional:
            raise ProfessionalDoesNotExist()
        professional.status = ProfessionalManager.get_professional_status(professional.license_expiration_date).value
        return professional

    @staticmethod
    def create(name: str, national_id: str, email: str, phone: str, address: str, license_number: str,
               license_expiration_date: date, professional_type: str, license_file_path: str = None) -> Professional:
        existing_professional = db_session.query(Professional).filter(
            (Professional.national_id == national_id) |
            (Professional.email == email)
        ).first()
        if existing_professional:
            raise ProfessionalAlreadyExists()
        professional = Professional(
            name=name,
            national_id=national_id,
            email=email,
            phone=phone,
            address=address,
            license_number=license_number,
            license_expiration_date=license_expiration_date,
            professional_type=professional_type,
            status=ProfessionalManager.get_professional_status(license_expiration_date).value,
            license_file_path=license_file_path if license_file_path else '',
            created_at=datetime.datetime.now(),
            updated_at=datetime.datetime.now()
        )

        db_session.add(professional)
        db_session.commit()
        
        # If license_file_path is provided, add it as a document
        if license_file_path:
            # Get an instance of ProfessionalManager to use instance methods
            professional_manager = ProfessionalManager()
            professional_manager.add_document(
                file_path=license_file_path,
                professional_id=str(professional.id),
                document_type=enum_to_value(ProfessionalDocumentType.LICENSE),
                document_name=f"License_{os.path.basename(license_file_path)}"
            )
            
        return professional

    def update(self, professional_id: str, name: str, national_id: str, email: str, phone: str, license_number: str,
               address: str, license_expiration_date: date, professional_type: str, license_file_path: str = None) -> Professional:
        professional = self.get_by_id(professional_id=professional_id)
        professional.name = name
        professional.national_id = national_id
        professional.email = email
        professional.phone = phone
        professional.license_number = license_number
        professional.address = address
        professional.license_expiration_date = license_expiration_date
        professional.professional_type = professional_type
        professional.status = ProfessionalManager.get_professional_status(license_expiration_date).value
        professional.updated_at = date.today()
        db_session.commit()
       
        # If license_file_path is provided, add it as a document
        if license_file_path:
            # Get an instance of ProfessionalManager to use instance methods
            professional_manager = ProfessionalManager()
            professional_manager.add_document(
                file_path=license_file_path,
                professional_id=str(professional.id),
                document_type=enum_to_value(ProfessionalDocumentType.LICENSE),
                document_name=f"License_{license_number}"
            )
        return professional

    def delete(self, professional_id: str) -> None:
        professional = self.get_by_id(professional_id)
        db_session.delete(professional)
        db_session.commit()

    @staticmethod
    def get_document(professional_id: str, document_id: str) -> ProfessionalDocument:
        document = db_session.query(ProfessionalDocument).filter(
            ProfessionalDocument.id == document_id,
            ProfessionalDocument.professional_id == professional_id
        ).first()
        if not document:
            raise ProfessionalDocumentNotFound()
        return document

    def add_document(self, file_path: str, professional_id: str, document_type: str,
                     document_name: str) -> ProfessionalDocument:
        self.get_by_id(professional_id=professional_id)
        # Create professionals documents directory if it doesn't exist
        professionals_dir = os.path.join(DOCUMENTS_FOLDER, 'professionals')
        if not os.path.exists(professionals_dir):
            os.makedirs(professionals_dir, exist_ok=True)
        # Create directory for this professional if it doesn't exist
        professional_dir = os.path.join(professionals_dir, professional_id)
        if not os.path.exists(professional_dir):
            os.makedirs(professional_dir, exist_ok=True)
        # Generate a unique filename
        filename = f"{document_type}_{document_name}"
        dest_path = os.path.join(professional_dir, filename)
        # Copy the file to the destination
        if os.path.exists(file_path):
            shutil.copy2(file_path, dest_path)
        # Create document record in database
        document = ProfessionalDocument(
            professional_id=professional_id,
            document_type=document_type,
            name=document_name,
            file_path=dest_path,
            status=enum_to_value(DocumentStatus.UPLOADED),
            created_at=datetime.datetime.now(),
        )
        db_session.add(document)
        db_session.commit()
        return document

    @staticmethod
    def remove_document(professional_id: str, document_id: str) -> None:
        document = db_session.query(ProfessionalDocument).filter(
            ProfessionalDocument.id == document_id,
            ProfessionalDocument.professional_id == professional_id
        ).first()
        if not document:
            raise ProfessionalDocumentNotFound()
        # Remove the file from the filesystem if it exists
        if document.file_path and os.path.exists(document.file_path):
            try:
                os.remove(document.file_path)
            except OSError as e:
                # Log the error but continue with database deletion
                import logging
                logging.error(f"Error removing file {document.file_path}: {e}")
        # Remove the document record from the database
        db_session.delete(document)
        db_session.commit()

    @staticmethod
    def get_document_types() -> list[str]:
        return [document_type.value for document_type in ProfessionalDocumentType]
    

    def _extact_pdf_data(file_path: str) -> dict:
        binary_data = process_pdf_image_to_binary(file_path)
        extract_professional = ExtractProfessional(binary_data,is_llm_enabled=False)
        license_data = extract_professional.extract_text()
        if license_data.license_number or license_data.license_expiration_date or license_data.id_number is None:
            binary_data = process_pdf_to_binary(file_path)
            extract_professional = ExtractProfessional(binary_data,is_llm_enabled=True)
            new_license_data = extract_professional.extract_text(license_data.__str__())
            if new_license_data:
                license_data = new_license_data
        return license_data
        

    def _extract_image_data(file_path: str) -> dict:
        binary_data = process_image_to_binary(file_path)
        extract_professional = ExtractProfessional(binary_data)
        license_data = extract_professional.extract_text()
        return license_data
    
    @staticmethod
    def extract_professional_data(file_path: str) -> dict:
        if mimetypes.guess_type(file_path)[0] == 'application/pdf':
            license_data = ProfessionalManager._extact_pdf_data(file_path)
        elif mimetypes.guess_type(file_path)[0] == 'image/jpeg' or mimetypes.guess_type(file_path)[0] == 'image/png':
            license_data = ProfessionalManager._extract_image_data(file_path)
        else:
            raise InvalidFileFormat(file_format=mimetypes.guess_type(file_path)[0])
        license_dict = license_data.__dict__()
        if license_dict.get('professional_type'):
            license_dict['professional_type'] = ProfessionalType.map_to_value(license_dict.get('professional_type'))
        license_dict['license_file_path'] = file_path
        return license_dict
    
    @staticmethod
    def get_professional_status(license_expiration_date: date) -> ProfessionalStatus:
        if license_expiration_date < date.today():
            return ProfessionalStatus.EXPIRED
        elif license_expiration_date < date.today() + timedelta(days=30):
            return ProfessionalStatus.WARNING
        else:
            return ProfessionalStatus.ACTIVE
        
   
def get_project_releated_types(document_type: str) -> list[str]:
    doc_required_names = ProjectDocumentManager.get_document_professionals_names(document_type)
    
    doc_required_values =  [ProfessionalManager.get_prof_value(professional_type) if ProfessionalManager.get_prof_value(professional_type) is not None 
                            else ProjectTeamManager.get_team_member_value(professional_type) for professional_type in doc_required_names]
    
    return doc_required_names, doc_required_values


def is_document_professional_related(project_id: str, document_type: ProjectDocumentType) -> bool:
    doc_required_members_names,_ = get_project_releated_types(document_type=document_type)
    project_professionals = ProjectManager.get_project_professionals(project_id=project_id)
    team_members = ProjectTeamManager.get_all_by_project(project_id=project_id)
    project_prof_types = [ProfessionalManager.get_prof_name(p_professional.professional_type) for p_professional in project_professionals]
    project_team_types = [team_member.role.name for team_member in team_members]
    for doc_required_member_name in doc_required_members_names:
        if doc_required_member_name not in project_prof_types+project_team_types:
            return False
    return True


def save_file_to_temp(file):
    tmpdir = tempfile.mkdtemp()
    file_path = os.path.join(tmpdir, file.filename)
    file.save(file_path)
    return file_path


class ProjectTeamManager:
    @staticmethod
    def get_all_by_project(project_id: str):
        team_members = db_session.query(ProjectTeamMember).filter(ProjectTeamMember.project_id == project_id).all()
        # Expunge objects from session to prevent SQLAlchemy from tracking changes
        for team_member in team_members:
            db_session.expunge(team_member)
            team_member.role = ProjectTeamRole.map_to_value(team_member.role)
        return team_members

    @staticmethod
    def get_by_id(team_id: str):
        team = db_session.query(ProjectTeamMember).filter(ProjectTeamMember.id == team_id).first()
        if not team:
            raise Exception('Project team member not found')
        return team

    @staticmethod
    def create(project_id: str, name: str, address: str, phone: str, role: str, email: str = None, signature_file_path: str = None) -> ProjectTeamMember:
        # Map role to enum for validation, then store as string
        role_enum = ProjectTeamRole.map_to_value(role)
        team_member = ProjectTeamMember(
            name=name,
            address=address,
            phone=phone,
            role=role_enum.value,
            email=email,
            signature_file_path=signature_file_path,
            project_id=project_id
        )
        db_session.add(team_member)
        db_session.commit()
        return team_member

    @staticmethod
    def update(team_id: str, name: str = None, address: str = None, phone: str = None, email: str = None, signature_file_path: str = None, role: str = None):
        team_member = ProjectTeamManager.get_by_id(team_id)
        if name is not None:
            team_member.name = name
        if address is not None:
            team_member.address = address
        if phone is not None:
            team_member.phone = phone
        if email is not None:
            team_member.email = email
        if signature_file_path is not None:
            team_member.signature_file_path = signature_file_path
        if role is not None:
            role_enum = ProjectTeamRole.map_to_value(role)
            team_member.role = role_enum.value
        team_member.updated_at = datetime.datetime.now()
        db_session.commit()
        return team_member

    @staticmethod
    def delete(team_id: str):
        team_member = ProjectTeamManager.get_by_id(team_id)
        db_session.delete(team_member)
        db_session.commit()

    @staticmethod
    def get_team_member_value(team_member_name: str) -> str:
        types = ProjectTeamRole.get_all()
        for type in types:
            if team_member_name == type.name:
                return type.value
        return None
def get_permit_owner_for_project(project_id):
  
    return db_session.query(ProjectTeamMember).filter_by(
        project_id=project_id,
        role=ProjectTeamRole.PERMIT_OWNER.value
    ).first()
