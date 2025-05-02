from datetime import date, datetime
import re
from enum import Enum

from sqlalchemy import Column, String, Date, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.orm import relationship
from database.base_model import Base
from database.database import engine
from database.database import UUID_F


class ProjectStatus(Enum):
    PRE_PERMIT = 'Pre permit'
    POST_PERMIT = 'Post permit'
    FINAL = 'Final'


class ProjectDocumentType(Enum):
    DRAWING = 'construction drawing'
    REPORT = 'report'
    LICENSE = 'construction license'
    PERMIT = 'building permit'
    SAFETY_CERTIFICATE = 'safety compliance certificate'
    INSPECTION_REPORT = 'inspection report'
    MATERIAL_SPECIFICATION = 'material specification document'
    CONTRACT = 'contract agreement'
    INSURANCE = 'insurance certificate'
    RISK_ASSESSMENT = 'risk assessment document'
    ENVIRONMENTAL_IMPACT = 'environmental impact report'
    SITE_PLAN = 'site plan'
    SOIL_REPORT = 'soil investigation report'
    STRUCTURAL_CALCULATION = 'structural calculation report'
    WORK_SCHEDULE = 'work schedule'
    CHANGE_ORDER = 'change order document'
    FINAL_ACCEPTANCE = 'final acceptance certificate'


class ProfessionalType(Enum):
    ENGINEER = 'מהנדס'
    ARCHITECT = 'אדריכל'
    PESTICIDAL = 'מדביר'
    OTHER = 'אחר'

    @staticmethod
    def map_to_professional_type(professional_type: str):
        if 'מהנדס' in professional_type:
            return ProfessionalType.ENGINEER.value
        elif 'מדביר' in professional_type:
            return ProfessionalType.PESTICIDAL.value
        elif 'אדריכל' in professional_type:
            return ProfessionalType.ARCHITECT.value
        else:
            return ProfessionalType.OTHER.value


class ProfessionalStatus(Enum):
    ACTIVE = 'Active'
    INACTIVE = 'Inactive'
    PENDING = 'Pending'


class ProfessionalDocumentType(Enum):
    LICENSE = 'license'


class DocumentStatus(Enum):
    PENDING = 'Pending'
    SIGNED = 'Signed'
    DELIVERED = 'Delivered'
    UPLOADED = 'Uploaded'
    MISSING = 'Missing'


# Models


class Project(Base):
    __tablename__ = 'projects'
    id = Column(UUID_F(), primary_key=True, default=UUID_F.uuid_allocator, unique=True, nullable=False)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    case_id = Column(String, nullable=False)

    description = Column(String, nullable=True)
    status = Column(String, nullable=True)
    status_due_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True)
    docs_path = Column(String, nullable=True)

    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('case_id', name='uix_case_id'),
    )

    documents = relationship("ProjectDocument", backref="project", cascade="all,delete")
    professionals = relationship("ProjectProfessional", backref="project", cascade="all,delete")

    def __init__(self, name: str, due_date: date, docs_path: str = None, status: str = None,
                 status_due_date: date = None, address: str = None, case_id: str = None,
                 description: str = None, **kwargs):

        if not name.strip():
            raise ValueError("Project name cannot be empty")

        super().__init__(
           name=name.strip(),
           due_date=due_date,
           docs_path=docs_path.strip() if docs_path else None,
           status=status,
           status_due_date=status_due_date,
           address=address,
           case_id=case_id,
           description=description,
           **kwargs
        )

    def __repr__(self):
        return f"<Project(name='{self.name}', case_id='{self.case_id}', status='{self.status}')>"


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
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('license_number', name='uix_license_number'),
        UniqueConstraint('email', name='uix_email'),
    )

    documents = relationship("ProfessionalDocument", backref="professional", cascade="all,delete")
    projects = relationship("ProjectProfessional", backref="professional", cascade="all,delete")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self._validate_email(self.email):
            raise ValueError("Invalid email format")
        if not self._validate_phone(self.phone):
            raise ValueError("Invalid phone number format")

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
    created_at = Column(DateTime, nullable=False)

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
    created_at = Column(DateTime, nullable=False)

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
    created_at = Column(DateTime, nullable=False)

    def __repr__(self):
        return f"<ProfessionalDocument(professional_id='{self.professional_id}', id='{self.id}'')>"


def init_tables():
    Base.metadata.create_all(engine)
