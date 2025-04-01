from datetime import date, datetime
from enum import Enum
import logging
import re
from sqlalchemy import Column, String, Date, ForeignKey, UniqueConstraint, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from database.base_model import Base
from database.database import engine
from database.database import UUID_F
from database.database import db_session
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Status(Enum):
    PRE_PERMIT = 'PRE_PERMIT'
    POST_PERMIT = 'POST_PERMIT'
    FINAL = 'FINAL'

class DocumentType(Enum):
    A = 'a'
    B = 'b'
    C = 'c'

class ProffsionalType(Enum):
    ENGINEER = 'engineer'
    ARCHITECT = 'architect'
    LAND_SURVEYOR = 'land_surveyor'
    OTHER = 'other'

class ProffsionalStatus(Enum):
    ACTIVE = 'active'
    EXPIRED = 'expired'

class DocumentStatus(Enum):
    PENDING = 'pending'
    SIGNED = 'signed'
    DELIVERED = 'delivered'
    UPLOADED = 'uploaded'
    MISSING = 'missing'

class ProjectProfessional(Base):
    __tablename__ = 'project_professionals'
    project_professional_id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    project_id = Column(UUID_F(), ForeignKey('projects.project_id'), nullable=False)
    professional_id = Column(UUID_F(), ForeignKey('professionals.proffsional_id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        UniqueConstraint('project_id', 'professional_id', name='uix_project_professional'),
    )
    
    project = relationship("Project", backref="project_professionals")
    professional = relationship("Proffsional", backref="project_professionals")
    
    def __repr__(self):
        return f"<ProjectProfessional(project_id='{self.project_id}', professional_id='{self.professional_id}')>"

class Proffsional(Base):
    __tablename__ = 'professionals'
    proffsional_id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    proffsional_national_id = Column(String, nullable=False) 
    proffsional_name = Column(String, nullable=False)
    proffsional_email = Column(String, nullable=False)
    proffsional_phone = Column(String, nullable=False)
    proffsional_address = Column(String, nullable=False)
    proffsional_license_number = Column(String, nullable=False)
    proffsional_license_expiration_date = Column(Date, nullable=False)
    proffsional_type = Column(SQLAlchemyEnum(ProffsionalType), nullable=False)
    proffsional_status = Column(SQLAlchemyEnum(ProffsionalStatus), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        UniqueConstraint('proffsional_license_number', name='uix_license_number'),
        UniqueConstraint('proffsional_email', name='uix_email'),
    )
    
    project_documents = relationship("ProjectDocument", backref="professional")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self._validate_email(self.proffsional_email):
            raise ValueError("Invalid email format")
        if not self._validate_phone(self.proffsional_phone):
            raise ValueError("Invalid phone number format")
    
    def _validate_email(self, email):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def _validate_phone(self, phone):
        pattern = r'^\+?1?\d{9,15}$'
        return re.match(pattern, phone) is not None
    
    def __repr__(self):
        return f"<Proffsional(name='{self.proffsional_name}', type='{self.proffsional_type}')>"

class Document(Base):
    __tablename__ = 'documents'
    document_id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    document_name = Column(String, nullable=False)
    document_type = Column(SQLAlchemyEnum(DocumentType), nullable=False)
    document_status = Column(SQLAlchemyEnum(DocumentStatus), nullable=False, default=DocumentStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        UniqueConstraint('document_name', name='uix_document_name'),
    )
    
    project_documents = relationship("ProjectDocument", backref="document")
    
    def __repr__(self):
        return f"<Document(name='{self.document_name}', type='{self.document_type}')>"

class ProffsionalTypeDocument(Base):
    __tablename__ = 'proffsional_type_documents'
    proffsional_type_document_id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    proffsional_type = Column(SQLAlchemyEnum(ProffsionalType), nullable=False)
    document_type = Column(SQLAlchemyEnum(DocumentType), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        UniqueConstraint('proffsional_type', 'document_type', name='uix_prof_doc_type'),
    )

    @classmethod
    def get_document_types_for_professional(cls, professional_type: ProffsionalType):
        """Get all document types required for a specific professional type"""
        return [doc.document_type for doc in cls.query.filter_by(proffsional_type=professional_type).all()]

    @classmethod
    def get_professional_types_for_document(cls, document_type: DocumentType):
        """Get all professional types that can handle a specific document type"""
        return [prof.proffsional_type for prof in cls.query.filter_by(document_type=document_type).all()]

    def __repr__(self):
        return f"<ProffsionalTypeDocument(proffsional_type='{self.proffsional_type}', document_type='{self.document_type}')>"

class ProjectDocument(Base):
    __tablename__ = 'project_documents'
    project_document_id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    project_id = Column(UUID_F(), ForeignKey('projects.project_id'), nullable=False)
    document_id = Column(UUID_F(), ForeignKey('documents.document_id'), nullable=False)
    professional_id = Column(UUID_F(), ForeignKey('professionals.proffsional_id'), nullable=False)
    status = Column(SQLAlchemyEnum(DocumentStatus), nullable=False, default=DocumentStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<ProjectDocument(project_id='{self.project_id}', document_id='{self.document_id}', status='{self.status}')>"

class Project(Base):
    __tablename__ = 'projects'
    project_id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    project_name = Column(String, nullable=False)
    project_description = Column(String, nullable=True)
    project_address = Column(String, nullable=False)
    project_case_id = Column(String, nullable=False)
    project_status = Column(SQLAlchemyEnum(Status), nullable=True)
    project_status_due_date = Column(Date, nullable=True)
    project_due_date = Column(Date, nullable=True)
    project_docs_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        UniqueConstraint('project_case_id', name='uix_case_id'),
    )
    
    documents = relationship("ProjectDocument", backref="project")

    def __init__(self, project_name: str, project_due_date: date, project_docs_path: str = None, 
                project_status: str = None, project_status_due_date: date = None, project_address: str = None, project_case_id: str = None, 
                project_description: str = None, **kwargs):
       
        if not project_name.strip():
            raise ValueError("Project name cannot be empty")
      
            
        super().__init__(
           project_name=project_name.strip(),
           project_due_date=project_due_date,
           project_docs_path=project_docs_path.strip() if project_docs_path else None,
           project_status=project_status,
           project_status_due_date=project_status_due_date,
           project_address=project_address,
           project_case_id=project_case_id,
           project_description=project_description,
           **kwargs
        )

    def __repr__(self):
        return f"<Project(name='{self.project_name}', case_id='{self.project_case_id}', status='{self.project_status}')>"

def init_tables():
    Base.metadata.create_all(engine)
  

