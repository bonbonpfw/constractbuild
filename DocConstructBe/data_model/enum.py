from ast import Dict
from enum import Enum
import os
from config.sys_config import CONFIG



class ProjectServiceType(Enum):
    START_WORK = 'SW'
    ENG_COORDINATOR = 'ENG'
    FOUR = 'FOUR'

class ProjectStatus(Enum):
    PRE_PERMIT = 'Pre permit'
    POST_PERMIT = 'Post permit'
    FINAL = 'Final'




class ProjectDocumentType(Enum):
    TLV_SW_TRASH_INSPECTION = 'אחראי לביקורת על הפסולת'
    TLV_SW_ADAPTER_AGREEMENT = 'אחראי לתיאום עם מכון בקרה'
    TLV_SW_START_WORK_REQUEST = 'בקשה לתחילת עבודות'
    TLV_SW_STRUCTURAL_SUPERVISOR = 'מינוי אחראי לביצוע שלד (101)'
    TLV_SW_EXECUTION_INSPECTION = 'מינוי אחראי לביקורת על הביצוע'
    TLV_SW_PESTICIDAL_OWNER = 'מינוי מדביר מוסמך'
    TLV_SW_CONTRACTOR_OWNER = 'מינוי קבלן רשום'
    TLV_SW_GREEN_BUILD = 'מינוי בניה ירוקה'
    TLV_SW_PROJECT_TEAMS = 'רשימת בעלי תפקידים'
    RG_SW_CHARGE_INSPECTION = 'מינוי אחראי לביקורת'
    RG_SW_CHARGE_STRACTURAL = 'מינוי אחראי לביצוע שלד'
    RG_SW_ADAPTER_AGREEMENT = 'מינוי אחראי לתיאום עם מכון בקרה'
    RG_SW_ANNOUN_INSPECTION = 'הצהרה אחראי לביקורת'
    RG_SW_ANNOUN_STRACTURAL = 'הצהרת אחרי שלד'
    RG_SW_ANNOUN_CONTRACTOR = 'הצהרת קבלן'
    RG_SW_CHARGE_CONTRACTOR = 'מינוי קבלן'
    RG_SW_ANNOUN_STABLE = 'הצהרת אחראי לבקורת ליציבות גדרות'
    RG_SW_MODED = 'אישור מודד'
    RG_SW_REQ_START_WORK = 'בקשה להתחלת עבודות'
    RG_SW_PROJECT_TEAMS = 'בפרויקט בעלי תפקידים'
    GENERAL = 'כללי'
    TLV_ENG_FORCE_MAJORITY = 'יפוי כח יזם'
    TLV_ENG_COMMITMENT_TO_SIGN_CONTRACTOR = 'התחייבות לחתימת קבלן'
    TLV_ENG_TRAFFIC_ORDER = 'הסדרי תנועה'
   

class City(Enum):
    TLV = 'TelAviv'
    RG = 'RamatGan'
    RH = 'RamatHasharon'
    RN = 'Raanana'


class ProjectDocPath(Enum):
    TRASH_INSPECTION = os.path.join(CONFIG, "docs", "TRASH_INSPECTION.yaml")
    ADAPTER_AGREEMENT = os.path.join(CONFIG, "docs", "ADAPTER_AGREEMENT.yaml")
    START_WORK_REQUEST = os.path.join(CONFIG, "docs", "START_WORK_REQUEST.yaml")
    STRUCTURAL_SUPERVISOR = os.path.join(CONFIG, "docs", "STRUCTURAL_SUPERVISOR.yaml")
    EXECUTION_INSPECTION = os.path.join(CONFIG, "docs", "EXECUTION_INSPECTION.yaml")
    PESTICIDAL_OWNER = "PESTICIDAL_OWNER.yaml"
    CONTRACTOR_OWNER = os.path.join(CONFIG, "docs", "CONTRACTOR_OWNER.yaml")
    PROJECT_TEAMS = os.path.join(CONFIG, "docs", "PROJECT_TEAMS.yaml")
    GREEN_BUILD = os.path.join(CONFIG, "docs", "GREEN_BUILD.yaml")
    

class ProfessionalType(Enum):
    SUPERVISOR_ENGINEER = 'אחראי ביקורת - כללי'
    SUPERVISOR_ENGINEER_CONSTRUCTION = 'אחראי ביקורת - קונסטרוקציה'
    SUPERVISOR_ENGINEER_ARCHITECTURE = 'אחראי ביקורת - אדריכלות'
    SUPERVISOR_CONTROL_MANAGER = 'אחראי מכון בקרה'
    SUPERVISOR_GREEN_BUILD = 'אחראי בנייה ירוקה'
    STRUCTURAL_ENGINEER = 'אחראי לביצוע שלד'
    
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
        elif "אחראי מכון בקרה" in value:
            return ProfessionalType.SUPERVISOR_CONTROL_MANAGER
        elif "אחראי בנייה ירוקה" in value:
            return ProfessionalType.SUPERVISOR_GREEN_BUILD
        elif "אחראי לביצוע שלד" in value:
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
    GENERAL = 'General'
    SIGNED = 'Signed'
    FILLED = 'Filled'
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

def project_doc_path_for_city(*, city: str, doc: str, version: int | None = None) -> str:
   path = os.path.join(CONFIG, "docs", city,doc+f"_v{version}.yaml")
   if not os.path.exists(path):
      path = os.path.join(CONFIG, "docs", city,doc+".yaml")
   return path
