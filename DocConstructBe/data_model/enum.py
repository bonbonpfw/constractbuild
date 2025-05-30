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
    PROFESSIONAL_LIST = 'רשימת בעלי תפקידים'
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
    def map_to_value(value: str) -> 'ProfessionalType':
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

def enum_to_value(enum_member_or_value):
    return enum_member_or_value.value if hasattr(enum_member_or_value, "value") else enum_member_or_value
