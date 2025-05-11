from datetime import date, datetime
import re
from data_model.enum import ProjectStatus, ProjectDocumentType, ProfessionalType, ProfessionalStatus, ProfessionalDocumentType, DocumentStatus, enum_to_value
from sqlalchemy import Column, String, Date, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy import Enum
from sqlalchemy.orm import relationship
from database.base_model import Base
from database.database import engine
from database.database import UUID_F


class PermitOwner(Base):
    __tablename__ = 'permit_owners'
    id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    signature_file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
  
    def __init__(self, name: str, address: str, phone: str, email: str = None, signature_file_path: str = None):
        self.name = name
        self.address = address
        self.phone = phone
        self.email = email
        self.signature_file_path = signature_file_path

    def __repr__(self):
        return f"<PermitOwner(name='{self.name}', address='{self.address}', phone='{self.phone}', email='{self.email}')>"


class Project(Base):
    __tablename__ = 'projects'
    id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    permit_owner_id = Column(UUID_F(), ForeignKey('permit_owners.id'), nullable=False)
    name = Column(String, nullable=False)
    request_number = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, nullable=True)
    status_due_date = Column(Date, nullable=True)
    docs_path = Column(String, nullable=True)
    permit_number = Column(String, nullable=True)
    construction_supervision_number = Column(String, nullable=True)
    engineering_coordinator_number = Column(String, nullable=True)
    firefighting_number = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    
    __table_args__ = (
        UniqueConstraint('request_number', name='uix_request_number'),
    )

    documents = relationship("ProjectDocument", backref="project", cascade="all,delete")
    professionals = relationship("ProjectProfessional", backref="project", cascade="all,delete")
    permit_owner = relationship("PermitOwner", backref="projects", cascade="all,delete")


    def __init__(self, name: str, permit_owner: PermitOwner,request_number: str,permit_number: str=None,
                 construction_supervision_number: str=None,engineering_coordinator_number: str=None,
                 firefighting_number: str=None,docs_path: str = None, status: str = None,
                 status_due_date: date = None,
                 description: str = None, **kwargs):

        if not name.strip():
            raise ValueError("Project name cannot be empty")

        super().__init__(
           name=name.strip(),
           permit_owner=permit_owner,
           docs_path=docs_path.strip() if docs_path else None,
           status=status,
           status_due_date=status_due_date,
           request_number=request_number,
           permit_number=permit_number,
           construction_supervision_number=construction_supervision_number,
           engineering_coordinator_number=engineering_coordinator_number,
           firefighting_number=firefighting_number,
           description=description,
           **kwargs
        )

    def __repr__(self):
        return f"<Project(name='{self.name}', request_number='{self.request_number}', status='{self.status}', permit_owner='{self.permit_owner.name}')>"


class Professional(Base):
    __tablename__ = 'professionals'
    id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    name = Column(String, nullable=False)
    national_id = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    license_number = Column(String, nullable=False)
    license_expiration_date = Column(Date, nullable=False)
    professional_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    license_file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    documents = relationship("ProfessionalDocument", backref="professional", cascade="all,delete")
    projects = relationship("ProjectProfessional", backref="professional", cascade="all,delete")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self._validate_email(self.email):
            raise ValueError("Invalid email format")
        if not self._validate_phone(self.phone):
            raise ValueError("Invalid phone number format")
        if not self._validate_national_id(self.national_id):
            raise ValueError("Invalid national ID format")

    @staticmethod
    def _validate_national_id(national_id):
        pattern = r'^\d{5,10}$'  # בדיקה בסיסית – רק ספרות באורך 5 עד 10
        return re.match(pattern, national_id) is not None

    @staticmethod
    def _validate_email(email):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    @staticmethod
    def _validate_phone(phone):
        pattern = r'^\+?1?\d{9,15}$'
        return re.match(pattern, phone) is not None

    def __repr__(self):
        return f"<Professional(name='{self.name}', type='{self.professional_type}')>"


class ProjectProfessional(Base):
    __tablename__ = 'project_professionals'
    id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    project_id = Column(UUID_F(), ForeignKey('projects.id'), nullable=False)
    professional_id = Column(UUID_F(), ForeignKey('professionals.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('project_id', 'professional_id', name='uix_project_professional'),
    )

    def __repr__(self):
        return f"<ProjectProfessional(project_id='{self.project_id}', professional_id='{self.professional_id}')>"


class ProjectDocument(Base):
    __tablename__ = 'project_documents'
    id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    project_id = Column(UUID_F(), ForeignKey('projects.id'), nullable=False)
    document_type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ProjectDocument(project_id='{self.project_id}', id='{self.id}'')>"


class ProfessionalDocument(Base):
    __tablename__ = 'professional_documents'
    id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    professional_id = Column(UUID_F(), ForeignKey('professionals.id'), nullable=False)
    document_type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ProfessionalDocument(professional_id='{self.professional_id}', id='{self.id}'')>"


def init_tables():
    Base.metadata.create_all(engine)
