import glob
from data_model.enum import ProjectDocumentType, ProjectDocPath
from data_model.models import Professional, ProjectTeamMember
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
import io
import yaml
from config.sys_config import PROF_DOC_CONFIG, TTF_PATH
import os
from data_model.enum import ProjectTeamRole
import pdfplumber
from bidi.algorithm import get_display
from app.errors import NoCoordinatesFound
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentMap:
    _document_professional_map = None
    
    @property
    def document_professional_map(self):
        if self._document_professional_map is None:
            self._document_professional_map = self.get_document_professional_map()
        return self._document_professional_map
    
    @staticmethod    
    def get_document_professional_map():
        doc_professional_map = {}
        for conf_file in glob.glob(PROF_DOC_CONFIG + "/*.yaml"):
            with open(conf_file, 'r') as file:
                doc_map = yaml.safe_load(file)
                prof_types = doc_map.get('TYPES')
                name = os.path.basename(conf_file).replace('.yaml', '')
                doc_professional_map[name] = prof_types
        return doc_professional_map
    
    @staticmethod
    def load_prof_doc_config(doc_path: str):
        with open(doc_path, 'r') as file:
            return yaml.safe_load(file)
        

class DocumentFiller:
    def __init__(self, document_type: ProjectDocumentType, professionals: list[Professional],
                 team_members: list[ProjectTeamMember], src_pdf_path: str):
        self.document_name = document_type.name
        self.team_members = team_members
        self.permit_owner = next((member for member in team_members if member.role == ProjectTeamRole.PERMIT_OWNER), None)
        self.doc_required_members = professionals + team_members
        self.src_pdf_path = src_pdf_path
       
    
    def _adjust_pesticidal_doc(self, coordinates):
        ID = "מספר זהות"
        ADDRESS = "כתובת"
        cords = {}
        for i, coord in enumerate(coordinates):
            if coord['text'][::-1] == ID:
                coordinates.insert(i + 1, {
                    'page': coord['page'],
                    'x': coord['x'] + 200,
                    'y': coord['y'],
                    'width': coord['width'],
                    'text': get_display("בעל המקצוע"),
                    'type': coord['type']
                })
            if (coord['x'],coord['y']) in cords:
                if coord['text'][::-1] == ADDRESS:
                    coordinates.remove(coord)
                    break
                else:
                    coordinates.remove(cords[(coord['x'],coord['y'])])

            cords[(coord['x'],coord['y'])] = coord

        return coordinates
    
    def get_doc_coordinates_by_field(self, pdf_path):
        DATE = "תאריך"
        coordinates = []
        field_labels = [
            "מספר זהות",
            "מספר טלפון",
            "כתובת",
            "מייל",
            "בעל ההיתר",
            "תאריך",
            "מספר רישיון",
            "שם פרטי ושם משפחה"
        ]
   

        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, start=1):
                    print(f"\n=== עמוד {page_num} ===")
                    page_height = page.height
                    words = page.extract_words()

                    # מיון המילים: מלמעלה למטה (y גבוה לנמוך), משמאל לימין (x נמוך לגבוה)
                    sorted_words = sorted(words, key=lambda w: (-w['bottom'], w['x0']))

                    # זיהוי תוויות מרובות מילים
                    for label in field_labels:
                        label_words = label.split()  # מפצל את התווית למילים
                        label_length = len(label_words)
                        for i in range(len(sorted_words) - label_length + 1):
                            # בדוק אם רצף המילים מתאים לתווית
                            candidate = " ".join(w['text'] for w in sorted_words[i:i + label_length])
                            if candidate[::-1] == label:
                                print(f"found label: {label[::-1]}")
                                # מצאנו את התווית
                                first_word = sorted_words[i]
                                last_word = sorted_words[i + label_length - 1]
                                x0 = min(first_word['x0'], last_word['x0'])
                                bottom = first_word['bottom']  # השתמש ב-y של המילה הראשונה
                                # הנח שהשדה נמצא משמאל לתווית (עברית: מימין לשמאל)
                                input_x = x0 - 110  # התאם לפי הצורך
                                input_width = 100   # התאם לפי הצורך
                                input_y = page_height - bottom 
                                field_type = 'text' if label not in [DATE] else label
                                coordinates.append({
                                    'page': page_num,
                                    'x': input_x,
                                    'y': input_y,
                                    'width': input_width,
                                    'text': get_display(label),
                                    'type': field_type
                                })
        except Exception as e:
            print(f"שגיאה בחילוץ קואורדינטות: {e}")
        coordinates = self._adjust_pesticidal_doc(coordinates)
        return coordinates
    
    def get_table_cell_coordinates(self,pdf_path):
        
        coordinates = []
        roles = [
            "בעל ההיתר",
            "נציג בעל ההיתר",
            "עורך הבקשה",
            "אחראי לביקורת",
            "קבלן ראשי",
            "נציג הקבלן",
            "מנהל פרויקט"
        ]
        
        def reverse_hebrew(text):
            # הפיכת טקסט עברי
            return text[::-1] if any(0x0590 <= ord(c) <= 0x05FF for c in text) else text

        with pdfplumber.open(pdf_path) as pdf:
            page = pdf.pages[0]  # הטבלה בעמוד 1
            page_height = page.height
            vertical_lines = sorted(set(l['x0'] for l in page.lines if abs(l['y0'] - l['y1']) > 10), key=lambda x: x)
            horizontal_lines = sorted(set(l['y0'] for l in page.lines if abs(l['x0'] - l['x1']) > 10), key=lambda y: -y)
            if len(vertical_lines) >= 7 and len(horizontal_lines) >= 8:  # 6 עמודות, 7 שורות
                for row_idx in range(1, len(horizontal_lines) - 1):  # שורות תוכן
                    y_top = horizontal_lines[row_idx - 1]
                    y_bottom = horizontal_lines[row_idx]
                    row_text = page.crop((0, page_height - y_top, page.width, page_height - y_bottom)).extract_text()
                    row_text_reversed = reverse_hebrew(row_text)
                    role = next((r for r in roles if r in row_text_reversed), None)
                    if role:
                        for col_idx in range(len(vertical_lines) - 1):
                            x_left = vertical_lines[col_idx]
                            x_right = vertical_lines[col_idx + 1]
                            width = x_right - x_left
                            cell_coords = {
                                'page': 1,
                                'x': x_left,
                                'y': page_height - y_top - 40,
                                'width': width,
                                'text': f'cell_{row_idx}_{col_idx}',
                                'type': f'table_cell_{role}_{col_idx + 1}'
                            }
                            coordinates.append(cell_coords)
                            print(f"תא עבור {role}, עמודה {col_idx + 1}: {cell_coords}")
        
        return coordinates
    
    def get_underline_coordinates(self,pdf_path):
        coordinates = []
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                page_height = page.height
                chars = page.chars
                
                # מיון התווים: מלמעלה למטה (y גבוה לנמוך), משמאל לימין (x נמוך לגבוה)
                sorted_chars = sorted(chars, key=lambda c: (-c['bottom'], c['x0']))
                
                current_underline = []
                prev_char = None
                for char in sorted_chars:
                    if char['text'] in '_/':
                        if not current_underline or (
                            abs(char['bottom'] - prev_char['bottom']) < 3 and  # סובלנות y
                            abs(char['x0'] - prev_char['x1']) < 5  # סובלנות x (רציף)
                        ):
                            current_underline.append(char)
                        else:
                            # שמירת רצף קודם אם ארוך מספיק
                            if len(current_underline) >= 2:
                                x0 = min(c['x0'] for c in current_underline)
                                x1 = max(c['x1'] for c in current_underline)
                                bottom = current_underline[0]['bottom']
                                text = ''.join(c['text'] for c in current_underline)
                                field_type = 'date' if '/' in text else 'underline'
                                width = x1 - x0
                            
                                coordinates.append({
                                    'page': page_num,
                                    'x': x0,
                                    'y': page_height - bottom,  # התאמה ל-reportlab
                                    'width': width,
                                    'text': text,
                                    'type': field_type
                                })
                            current_underline = [char]
                    else:
                        # שמירת רצף קודם אם ארוך
                        if len(current_underline) >= 2:
                            x0 = min(c['x0'] for c in current_underline)
                            x1 = max(c['x1'] for c in current_underline)
                            bottom = current_underline[0]['bottom']
                            text = ''.join(c['text'] for c in current_underline)
                            field_type = 'date' if '/' in text else 'underline'
                            width = x1 - x0
                            coordinates.append({
                                'page': page_num,
                                'x': x0,
                                'y': page_height - bottom,
                                'width': width,
                                'text': text,
                                'type': field_type
                            })
                        current_underline = []
                    prev_char = char
                
                # שמירת הרצף האחרון
                if len(current_underline) >= 2:
                    # ... (כמו למעלה)
                    x0 = min(c['x0'] for c in current_underline)
                    x1 = max(c['x1'] for c in current_underline)
                    bottom = current_underline[0]['bottom']
                    text = ''.join(c['text'] for c in current_underline)
                    field_type = 'date' if '/' in text else 'underline'
                    width = x1 - x0
                    coordinates.append({
                        'page': page_num,
                        'x': x0,
                        'y': page_height - bottom,
                        'width': width,
                        'text': text,
                        'type': field_type
                    })
        return coordinates

    def get_doc_coordinates(self,pdf_path):
        if self.document_name == ProjectDocumentType.PESTICIDAL_OWNER.name:
            return self.get_doc_coordinates_by_field(pdf_path)
        elif self.document_name == ProjectDocumentType.PROJECT_TEAMS.name:
            return self.get_table_cell_coordinates(pdf_path)
        else:
            return self.get_underline_coordinates(pdf_path)

    def overlay_filled_on_original_pdf(self,pdf_path, coordinates, page=None, output_path=None):
        if output_path is None:
            base_name = os.path.splitext(pdf_path)[0]
            output_path = f"{base_name}_filled.pdf"
        
        self.document_positions = DocumentMap.load_prof_doc_config(ProjectDocPath[self.document_name].value)
        required_members = [member for member in self.doc_required_members if member.role.name.lower() in self.document_positions.get("TYPES")]
        
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        with pdfplumber.open(pdf_path) as pdf:
            pages = pdf.pages if page is None else [pdf.pages[0]]
            doc_version = self.document_positions.get(len(pages))  
            self.fill_pages(pages, reader,writer,coordinates, doc_version,required_members)
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)
            
        return output_path
           
    def fill_pages(self,pages, reader,writer,coordinates, doc_version,required_members):
       
            for page_num, (page, pdf_page) in enumerate(zip(pages, reader.pages), start=1):
                logger.info(f"Filling page {page_num}")
                doc_version_prof_page = doc_version.get(page_num)
                logger.info(f"Doc version prof page: {doc_version_prof_page}")
                page_width = page.width
                page_height = page.height
                
                packet = io.BytesIO()
                c = canvas.Canvas(packet, pagesize=(page_width, page_height))
                
                page_coords = [coord for coord in coordinates if coord['page'] == page_num]
                pdfmetrics.registerFont(TTFont("ArialHebrew", TTF_PATH))
                logger.info(f"Page coords: {page_coords}")
                for i, coord in enumerate(page_coords):
                    x = coord['x']
                    y = coord['y']
                    width = coord['width']
                    field_type = coord.get('type', 'underline')
                    
                    
                    font_size = min(12, max(8, width / 10))  # התאמה לרוחב אמיתי
                    c.setFont("ArialHebrew", font_size)
                    
                    if field_type == 'date':
                        c.setFillColorRGB(1, 0, 0)  # אדום
                    else:
                        c.setFillColorRGB(0, 0, 1)  # כחול
                    # Initialize text with empty string to avoid UnboundLocalError
                    text = ""
                    
                    # Check if doc_version_prof_page exists and the key exists
                    if doc_version_prof_page is not None:
                        logger.info(f"Doc version prof is not none")
                        logger.info(f" required members: {required_members}")
                        for member in required_members:
                            logger.info(f"Member: {member}")
                            logger.info(f"Doc version prof page: {doc_version_prof_page}")
                            logger.info(f"i: {i}")
                            logger.info(f"Doc version prof page: {doc_version_prof_page[i]}")
                            text = self.get_congif_text(doc_version_prof_page[i], member)
                            if text != "":
                                break
                    
                    # Only proceed with display and drawing if we have text
                    if text:
                        logger.info(f"Text: {text}")
                        text = get_display(text)
                        text_width = c.stringWidth(text, "ArialHebrew", font_size)
                        text_x = x + (width - text_width) / 2  # מרכוז
                        text_y = y + 5
                        
                        c.drawString(text_x, text_y, text)
                    
                    c.setStrokeColorRGB(0.5, 0.5, 0.5)
                    #c.setLineWidth(0.5)
                    #c.rect(x, y + 5, width, 20)
            
               
                
                c.save()
                
                packet.seek(0)
                overlay = PdfReader(packet)
                overlay_page = overlay.pages[0]
                
                pdf_page.merge_page(overlay_page)
                writer.add_page(pdf_page)
            
    
    def fill_document(self):
        coordinates = self.get_doc_coordinates(self.src_pdf_path)
        if not coordinates:
            raise NoCoordinatesFound()  
        if self.document_name == ProjectDocumentType.PESTICIDAL_OWNER.name:
            output_path = self.overlay_filled_on_original_pdf(self.src_pdf_path, coordinates, page=1)
        else:
            output_path = self.overlay_filled_on_original_pdf(self.src_pdf_path, coordinates)
        return output_path

  
    def get_congif_text(self, i, required_member):
        # Ensure i is a string for comparison
        if not isinstance(i, str):
            return ""
            
        prefix = required_member.role.name.lower()
        
        if i == f"{prefix}_name":
            return required_member.name or ""
        elif i == f"{prefix}_id":
            return required_member.national_id or ""
        elif i == f"{prefix}_address":
            return required_member.address or ""
        elif i == f"{prefix}_phone":
            return required_member.phone or ""
        elif i == f"{prefix}_mail":
            return required_member.email or ""
        elif i == f"{prefix}_license_number":
            return required_member.license_number or ""
        elif i == f"{prefix}_license_expiration_date":
            if required_member.license_expiration_date:
                return required_member.license_expiration_date.strftime("%d/%m/%Y")
            return ""
        elif i == "date":
            return datetime.now().strftime("%d/%m/%Y")
        
        return ""

