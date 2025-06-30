import logging
import re
from datetime import datetime
from ai.llm import LlmLicenseExtractor,JSONParserForLLM,FieldNames

class LicenseData:
    def __init__(self):
        self.profession_type = None
        self.name = None
        self.id_number = None
        self.license_number = None
        self.license_expiration_date = None
        self.address = None
        self.email = None
        self.phone = None
        
    def __str__(self):
        return (
            f"Profession: {self.profession_type}\n"
            f"Name: {self.name}\n"
            f"national_id: {self.id_number}\n"
            f"License Number: {self.license_number}\n"
            f"Expiration Date: {self.license_expiration_date}\n"
            f"Address: {self.address}\n"
        )
                
    def __dict__(self):
        return {
            'name': self.name,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'professional_type': self.profession_type,
            'national_id': self.id_number,
            'license_number': self.license_number,
            'license_expiration_date': self.license_expiration_date,
        }


class LicenseExtract:
    def __init__(self):
         self.license_config = {
            "id_pattern": r'(?:מספר ת"ז|מספר ת\.ז|ת\.ז|ת"ז|תעודת זהות|ח\.פ|ID)[\s:]*(\d{9})',
            'date_pattern': r'(?:תאריך תפוגה|בתוקף עד|תוקף|תפוגה)[\s:]*(\d{8}|\d{2}[\/]?\d{2}[\/]?\d{4})',
            "name_pattern": r'(?:שם|שם פרטי|שם פרטי ושם משפחה|מרה|שם משפחה)[\s:]*((?:\S+\s+){0,1}\S+)',
            "license_pattern": r'(?:מספר רישיון|רישיון|מס תעודה |מס\' רישיון|מס רישיון)[\s:]*(\d{4,8})',
            "proffessional_type_pattern": r'רישיון\s+(\S+)'
        }
       
    @property
    def id_pattern(self):
        return self.license_config['id_pattern']  
  
    @property
    def date_pattern(self):
        return self.license_config['date_pattern'] 
   
    @property
    def name_pattern(self):
        return self.license_config['name_pattern']

    @property
    def license_pattern(self):
        return self.license_config['license_pattern']
    
    @property
    def proffessional_type_pattern(self):
        return self.license_config['proffessional_type_pattern']
    
    def __str__(self):
        return (
            f"Professional: {self.profession}, "
            f"Department: {self.department}, "
            f"Name: {self.name}, "
            f"ID: {self.id_number}, "
            f"License: {self.license_number}, "
            f"Expiration: {self.license_expiration_date}"
        )

class ExtractProfessional:
    def __init__(self, text: bytes=None, file_path: str=None, is_llm_enabled: bool = False):
        if text:
            self.text = self._clean_text(text)
        self.license_extract = LicenseExtract()
        self.license_data = LicenseData()
        self.is_llm_enabled = is_llm_enabled
        if self.is_llm_enabled and file_path:  
            self.llm_extractor = LlmLicenseExtractor()
            self.file_path = file_path

          
    def _clean_text(self, text: str) -> str:
        """Remove single quotes and forward slashes from text"""
        return text.replace("'", "").replace("/", "")

    def extract_text(self,file_type: str=None):
        if self.is_llm_enabled:
            try:
                answer = self.llm_extractor.extract_text_from_license(self.file_path,file_type)
                for field in FieldNames:
                    field_data = JSONParserForLLM().extract_field(str(answer),field)
                    setattr(self.license_data, field, field_data)
            except Exception as e:
                logging.error(f"Cannot connect to LLM: {e}")
                return None
        else:
            id = self._extract_id(self.text)
            date = self._extract_date(self.text)
            name = self._extract_name(self.text)
            license = self._extract_license(self.text)
            type = self._extract_type(self.text)
        return self.license_data

    def _extract_id(self, text: str):
        id_match = re.search(self.license_extract.id_pattern, text)
        if id_match:
            # Use group(1) to get the actual ID number from the capture group
            id_number = id_match.group(1) if len(id_match.groups()) > 0 else id_match.group()
            self.license_data.id_number = id_number
            return id_number
        else:
            logging.error(f"לא ניתן למצוא תעודת זהות בטקסט: ...")
            return None

    def _extract_date(self, text: str):
        date_match = re.search(self.license_extract.date_pattern, text)
        if date_match:
            date_str = date_match.group(1) if len(date_match.groups()) > 0 else date_match.group()            
            # Handle different date formats
            if '/' in date_str:
                # Format: DD/MM/YYYY
                extracted_date = datetime.strptime(date_str, '%d/%m/%Y')
            else:
                # Format: DDMMYYYY (8 digits)
                if len(date_str) == 8:
                    day = date_str[:2]
                    month = date_str[2:4] 
                    year = date_str[4:]
                    extracted_date =  datetime.strptime(f"{day}/{month}/{year}", '%d/%m/%Y')
    
            self.license_data.license_expiration_date = extracted_date
            return extracted_date
        else:
            logging.error(f"לא ניתן למצוא תאריך תפוגה בטקסט: ...")
            return None

    def _extract_name(self, text: str):
        name_match = re.search(self.license_extract.name_pattern, text)
        if name_match:
            name = name_match.group(1) if len(name_match.groups()) > 0 else name_match.group()
            self.license_data.name = name
            return name
        else:
            logging.error(f"לא ניתן למצוא שם בטקסט: ...")
            return None

    def _extract_license(self, text: str):
        license_match = re.search(self.license_extract.license_pattern, text)
        if license_match:
            license_number = license_match.group(1) if len(license_match.groups()) > 0 else license_match.group()
            self.license_data.license_number = license_number
            return license_number
        else:
            logging.error(f"לא ניתן למצוא מספר רישיון בטקסט: ...")
            return None 

    def _extract_type(self, text: str):
        type_match = re.search(self.license_extract.proffessional_type_pattern, text)
        if type_match:
            prof_type = type_match.group(1) if len(type_match.groups()) > 0 else type_match.group()
            self.license_data.profession_type = prof_type
            return prof_type
        else:
            logging.error(f"לא ניתן למצוא תחום פעילות בטקסט: ...")
            return None