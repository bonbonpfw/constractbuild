from enum import Enum

class ProjectStatus(Enum):
    PRE_PERMIT = 'Pre permit'
    POST_PERMIT = 'Post permit'
    FINAL = 'Final'

class ProjectDocumentType(Enum):
    TRASH_INSPECTION = 'אחראי לביקורת על הפסולת'
    ADAPTER_AGREEMENT = 'אחראי לתיאום עם מכון בקרה'
    START_WORK_REQUEST = 'בקשה לתחילת עבודות'
    STRUCTURAL_SUPERVISOR = 'מינוי אחראי לביצוע שלד (101)'
    EXECUTION_INSPECTION = 'מינוי אחראי לביקורת על הביצוע'
    PESTICIDAL_OWNER = 'מינוי מדביר מוסמך'
    CONTRACTOR_OWNER = 'מינוי קבלן רשום'
    PROJECT_TEAMS = 'רשימת בעלי תפקידים'
    GENERAL = 'כללי'

class ProfessionalType(Enum):
    SUPERVISOR_ENGINEER = 'אחראי ביקורת - כללי'
    SUPERVISOR_ENGINEER_CONSTRUCTION = 'אחראי ביקורת - קונסטרוקציה'
    SUPERVISOR_ENGINEER_ARCHITECTURE = 'אחראי ביקורת - אדריכלות'
    STRUCTURAL_ENGINEER = 'מהנדס אחראי שלד'
    CONSTRUCTION_INSPECTION_OFFICER = 'אחראי לביקורת על ביצוע'
    ARCHITECT = 'אדריכל'
    PESTICIDAL = 'מדביר'
    GENERAL_CONTRACTOR = 'קבלן ראשי'

    @staticmethod   
    def map_to_value(value) -> 'ProfessionalType':
        if isinstance(value, ProfessionalType):
            return value
        if hasattr(value, 'value'):
            value = value.value
        value = str(value)
        if "אחראי ביקורת - כללי" in value:
            return ProfessionalType.SUPERVISOR_ENGINEER
        elif "אחראי ביקורת - קונסטרוקציה" in value:
            return ProfessionalType.SUPERVISOR_ENGINEER_CONSTRUCTION
        elif "אחראי ביקורת - אדריכלות" in value:
            return ProfessionalType.SUPERVISOR_ENGINEER_ARCHITECTURE
        elif "מהנדס אחראי שלד" in value:
            return ProfessionalType.STRUCTURAL_ENGINEER
        elif "אחראי לביקורת על ביצוע" in value:
            return ProfessionalType.CONSTRUCTION_INSPECTION_OFFICER
        elif "אדריכל" in value:
            return ProfessionalType.ARCHITECT
        elif "מדביר" in value:
            return ProfessionalType.PESTICIDAL
        elif "קבלן ראשי" in value:
            return ProfessionalType.GENERAL_CONTRACTOR
        return ProfessionalType.SUPERVISOR_ENGINEER

class ProfessionalStatus(Enum):
    ACTIVE = 'Active'
    EXPIRED = 'Expired'
    WARNING = 'Warning'

class ProfessionalDocumentType(Enum):
    LICENSE = 'license'

class DocumentStatus(Enum):
    PENDING = 'Pending'
    SIGNED = 'Signed'
    DELIVERED = 'Delivered'
    MISSING = 'Missing'
    UPLOADED = 'Uploaded'

class ProjectTeamRole(Enum):
    PERMIT_OWNER = 'בעל ההיתר'
    REQUEST_EDITOR = 'עורך הבקשה'
    CONTRACTOR_REPRESENTATIVE = 'נציג הקבלן'
    PROJECT_MANAGER = 'מנהל הפרויקט'
    PERMIT_OWNER_REPRESENTATIVE = 'נציג בעל ההיתר'

    @staticmethod
    def get_all() -> list[str]:
        return [role for role in ProjectTeamRole]
    
    @staticmethod
    def map_to_value(value) -> 'ProjectTeamRole':
        if isinstance(value, ProjectTeamRole):
            return value
        if hasattr(value, 'value'):
            value = value.value
        value = str(value)
        if "בעל ההיתר" == value:
            return ProjectTeamRole.PERMIT_OWNER
        elif "עורך הבקשה" == value:
            return ProjectTeamRole.REQUEST_EDITOR
        elif "נציג הקבלן" == value:
            return ProjectTeamRole.CONTRACTOR_REPRESENTATIVE
        elif "מנהל הפרויקט" == value:
            return ProjectTeamRole.PROJECT_MANAGER
        elif "נציג בעל ההיתר" == value:
            return ProjectTeamRole.PERMIT_OWNER_REPRESENTATIVE
        return ProjectTeamRole.PERMIT_OWNER

def enum_to_value(enum_member_or_value):
    return enum_member_or_value.value if hasattr(enum_member_or_value, "value") else enum_member_or_value
