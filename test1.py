from ast import List
from typing import Any
import pdfplumber
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
import os
import io
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from DocConstructBe.config.sys_config import TTF_PATH
from bidi.algorithm import get_display
import glob
import logging


        

class PDFFiller:
   
    @classmethod
    def _adjust_green_build_doc(self, coordinates):
        PHONE= "מספר טלפון"
        cords = {}
        for i, coord in enumerate(coordinates):
            if coord['text'][::-1] == PHONE:
                coordinates.append({
                    'page': coord['page'],
                    'x': coord['x'] + 60,
                    'y': coord['y']+ 25,
                    'width': coord['width'],
                    'text': get_display("הכשרה"),
                    'type': coord['type']
                })
                break
        return coordinates

    @classmethod
    def _adjust_pesticidal_doc(cls, coordinates):
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
    
    @classmethod
    def get_doc_coordinates_by_field(cls, pdf_path,type):
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
        
        coordinates = cls._adjust_pesticidal_doc(coordinates)
        if type == "GREEN_BUILD":
            coordinates = cls._adjust_green_build_doc(coordinates)
      
        return coordinates
    
    @classmethod
    def get_table_cell_coordinates(cls,pdf_path):
        
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
    
    @classmethod
    def get_underline_coordinates(cls,pdf_path):
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
                            abs(char['bottom'] - prev_char['bottom']) < 3 and  
                            abs(char['x0'] - prev_char['x1']) < 5  # 
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

    @classmethod
    def get_doc_coordinates(cls,pdf_path,document_name="ALL"):
        if document_name == "TABLE":
            return cls.get_table_cell_coordinates(pdf_path)
        
        return cls.get_underline_coordinates(pdf_path)

   
    @classmethod
    def overlay_filled_on_original_pdf(cls,pdf_path, coordinates, output_path=None):
        """
        מוסיף "XXX" ישירות על ה-PDF המקורי במקום ליצור קובץ חדש.
        """
        if output_path is None:
            base_name = os.path.splitext(pdf_path)[0]
            output_path = f"{base_name}_filled.pdf"
        
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        
        with pdfplumber.open(pdf_path) as pdf:
            pages = pdf.pages
            
            for page_num, (page, pdf_page) in enumerate(zip(pages, reader.pages), start=1):
                page_width = page.width
                page_height = page.height
                
                packet = io.BytesIO()
                c = canvas.Canvas(packet, pagesize=(page_width, page_height))
                
                page_coords = [coord for coord in coordinates if coord['page'] == page_num]
                pdfmetrics.registerFont(TTFont("ArialHebrew", TTF_PATH))
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
                    
                    text = f"XXX_{i}"
                    text = get_display(text)
                    text_width = c.stringWidth(text, "ArialHebrew", font_size)
                    text_x = x + (width - text_width) / 2  # מרכוז
                    text_y = y + 5
                    
                    c.drawString(text_x, text_y, text)
                    
                    c.setStrokeColorRGB(0.5, 0.5, 0.5)
                    #c.setLineWidth(0.5)
                    #c.rect(x, y - 15, width, 20)
                
                c.setFont("ArialHebrew", 10)
                c.setFillColorRGB(0, 0, 0)
                c.drawString(10, 20, f"עמוד {page_num}")
                
                c.save()
                
                packet.seek(0)
                overlay = PdfReader(packet)
                overlay_page = overlay.pages[0]
                
                pdf_page.merge_page(overlay_page)
                writer.add_page(pdf_page)
        
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)
        
        return output_path


if __name__ == "__main__":
    for pdf_path in glob.glob("Docs/RG/RG/*.pdf"):
        print(f"\n{'='*50}")
        print(f"Processing: {pdf_path}")
        print(f"{'='*50}\n")
        coords = PDFFiller.get_doc_coordinates(pdf_path)
        print(f"\nTotal found: {len(coords)} occurrences")
        output_file = PDFFiller.overlay_filled_on_original_pdf(pdf_path=pdf_path, coordinates=coords, output_path=f"out/{os.path.basename(pdf_path)}")
        print("end process:",output_file)

        print("\n")