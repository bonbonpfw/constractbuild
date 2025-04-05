import re
import yaml
import os

class LicenseConfig:
    def __init__(self):
        self.config = {
            "id_name": ["תעודת זהות", "ת.ז", "ח.פ"],
            "id_pattern": [r'\b\d{9,10}\b'],
            "date_name": ["תאריך תפוגה", "בתוקף עד"],
            "date_pattern": [r'\b\d{2}/\d{2}/\d{4}\b'],
            "name_name": ["שם", "שם פרטי", "שם פרטי ושם משפחה", "שם משפחה"],
            "name_pattern": [r'שם:\s*(.+)'],
            "license_name": ["מספר רישיון", "רישיון"],
            "license_pattern": [r'\b\d{4,8}\b']
        }




class Proffional:
    def __init__(self):
        self.license_config = LicenseConfig().config
        self.profession = None
        self.department = None
        self.name = None
        self.id_number = None
        self.license_number = None
        self.expiration_date = None
       
    @property
    def id_pattern(self):
        return self.license_config['id_pattern']  
    @property
    def id_name(self):
        return self.license_config['id_name'] 
    @property
    def date_pattern(self):
        return self.license_config['date_pattern'] 
    @property
    def date_name(self):
        return self.license_config['date_name']
    @property
    def name_pattern(self):
        return self.license_config['name_pattern']
    @property
    def name_name(self):
        return self.license_config['name_name']
    @property
    def license_name(self):
        return self.license_config['license_name']
    @property
    def license_pattern(self):
        return self.license_config['license_pattern']
    
    def __str__(self):
        return f"Professional: {self.profession}, Department: {self.department}, Name: {self.name}, ID: {self.id_number}, License: {self.license_number}, Expiration: {self.expiration_date}"

class ExtractProfessional:
    def __init__(self, binary_data: bytes):
        self.text = binary_data.decode('utf-8', errors='ignore')
        self.professional = Proffional()

    def extract_from_image(self):
        lines = self.text.strip().split('\n')
        for line in lines:
            self._extract_id(line)
            self._extract_date(line)
            self._extract_name(line)
            self._extract_license(line)

    def extract_from_pdf(self):
        self._extract_id(self.text)
        self._extract_date(self.text)
        self._extract_license(self.text)
        self._extract_name_from_pdf(self.text)
        return self.professional

    def _extract_id(self, text: str):
        for id_name in self.professional.id_name:
            if id_name in text:
                id_match = re.search(self.professional.id_pattern, text)
                if id_match:
                    self.professional.id_number = id_match.group()
                else:
                    self.professional.id_number = text.split(id_name)[1].strip()
       
    def _extract_date(self, text: str):
        for date_name in self.professional.date_name:
            if date_name in text:
                self.professional.expiration_date = text.split(date_name)[1].strip()
        for pattern in self.professional.date_pattern:
            expiration_match = re.search(pattern, text)
            if expiration_match:
                self.professional.expiration_date = expiration_match.group()

    def _extract_name(self, text: str):
        for name_name in self.professional.name_name:
            if name_name in text:
                self.professional.name = text.split(name_name)[1].strip()

    def _extract_license(self, text: str):
        for license_name in self.professional.license_name:
            if license_name in text:
                self.professional.license_number = text.split(license_name)[1].strip()
        for pattern in self.professional.license_pattern:
            license_match = re.search(pattern, text)
            if license_match:
                self.professional.license_number = license_match.group()

    def _extract_name_from_pdf(self, text: str):
        lines = text.strip().split('\n')
        for line in lines:
            name_match = re.match(r"^(.*?)\s+\d{9}$", line)
            if name_match:
                self.professional.name = name_match.group(1).strip()


def smart_extract_license(binary_data):
   
    text = binary_data.decode('utf-8')
    lines = text.strip().split('\n')  

    profession = ""
    department = ""
    name = ""
    id_number = ""
    license_number = ""
    expiration_date = ""
    
    # דפוסים לזיהוי (regex)
    id_pattern = r'\b\d{9}\b' 
    license_pattern = r'\b\d{5,8}\b' 
    date_pattern = r'\b\d{2}/\d{2}/\d{4}\b'  # תאריך: dd/mm/yyyy
    
    # עיבוד כל שורה
    for line in lines:
        words = line.split()
        for word in words:
            # חיפוש תאריך תפוגה
            date_match = re.search(date_pattern, word)
            if date_match:
                expiration_date = date_match.group()
                continue
            
            # חיפוש ת"ז (9 ספרות)
            id_match = re.search(id_pattern, word)
            if id_match:
                id_number = id_match.group()
                # השם הוא מה שמופיע לפני הת"ז בשורה
                name = line.replace(id_number, '').strip()
                continue
            
            # חיפוש מספר רישיון (8 ספרות)
            license_match = re.search(license_pattern, word)
            if license_match:
                license_number = license_match.group()
                continue
            
            # אם אין ת"ז, תאריך או מספר רישיון, זו כנראה שורת מקצוע/מדור
        
            if not profession:  # אם עדיין לא מצאנו מקצוע
                profession = word
            else:  # אחרת, זה כנראה מדור
                department = words
    
    # התמודדות עם מקרים שבהם המקצוע והמדור נדבקו יחד
    if profession and not department:
        if len(profession) > 1:
            # נניח שהמילה האחרונה היא המדור והשאר המקצוע
            department = [profession[-1]]
            profession = profession[:-1]
    
    # החזרת המילון
    return {
        "Profession (מקצוע)": " ".join(profession) if profession else "לא נמצא",
        "Department (מדור)": " ".join(department) if department else "לא נמצא",
        "Name (שם)": name if name else "לא נמצא",
        "ID Number (תעודת זהות)": id_number if id_number else "לא נמצא",
        "License Number (מספר רישיון)": license_number if license_number else "לא נמצא",
        "Expiration Date (תאריך תפוגה)": expiration_date if expiration_date else "לא נמצא"
    }

