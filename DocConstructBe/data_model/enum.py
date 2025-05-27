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
    SUPERVISOR_ENGINEER = 'מהנדס אחראי ביקורת'
    STRUCTURAL_ENGINEER = 'מהנדס אחראי שלד'
    CONSTRUCTION_INSPECTION_OFFICER = 'אחראי לביקורת על ביצוע'
    ARCHITECT = 'אדריכל'
    PESTICIDAL = 'מדביר'
    GENERAL_CONTRACTOR = 'קבלן ביצוע'

    @staticmethod
    def map_to_value(value: str) -> 'ProfessionalType':
        if "מהנדס אחראי ביקורת" in value:
            return ProfessionalType.SUPERVISOR_ENGINEER
        elif "מהנדס אחראי שלד" in value:
            return ProfessionalType.STRUCTURAL_ENGINEER
        elif "אחראי לביקורת על ביצוע" in value:
            return ProfessionalType.CONSTRUCTION_INSPECTION_OFFICER
        elif "אדריכל" in value:
            return ProfessionalType.ARCHITECT
        elif "מדביר" in value:
            return ProfessionalType.PESTICIDAL
        elif "קבלן ביצוע" in value:
            return ProfessionalType.GENERAL_CONTRACTOR
        return value

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
