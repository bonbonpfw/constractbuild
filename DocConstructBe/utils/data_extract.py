import logging
import re
from datetime import datetime


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
            "date_pattern": r'(?:תאריך תפוגה|בתוקף עד|תוקף|תפוגה)[\s:]*(\d{2}/\d{2}/\d{4})',
            "name_pattern": r'(?:שם|שם פרטי|שם פרטי ושם משפחה|שם משפחה)[\s:]*((?:\S+\s+){0,1}\S+)',
            "license_pattern": r'(?:מספר רישיון|רישיון|מס\' רישיון|מס רישיון)[\s:]*(\d{4,8})',
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
    def __init__(self, text: bytes):
        self.text = text
        self.license_extract = LicenseExtract()
        self.license_data = LicenseData()

    def extract_text(self):
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
            date = date_match.group(1) if len(date_match.groups()) > 0 else date_match.group()
            date = datetime.strptime(date, '%d/%m/%Y')
            self.license_data.license_expiration_date = date
            return date
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
            # If standard pattern fails, try to find name near ID
            id_position = text.find(self.license_extract.id_number) if self.license_extract.id_number else -1
            if id_position > 0:
                # Look for name before ID (typical format in Israeli documents)
                name_text = text[:id_position].strip().split('\n')[-1]
                if name_text and len(name_text) > 2:
                    self.license_data.name = name_text
                    return name_text
            
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