from data_model.enum import ProjectDocumentType
from data_model.models import Professional, ProjectTeamMember
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
import io
import yaml
from config.sys_config import DOCUMENTS_FOLDER, PROF_DOC_CONFIG, TTF_PATH
import os
from data_model.enum import ProjectTeamRole
"""
Document Mapping Module

This module defines the mapping between document types and the coordinates
for filling out information in those documents (name, ID, phone number, etc.).
Each document type can have different coordinates for different fields.
"""

def load_prof_doc_config():
    with open(PROF_DOC_CONFIG, 'r') as file:
        return yaml.safe_load(file)
    
class DocumentMap:
    PROF_DOC_CONFIG = load_prof_doc_config()
    DOCUMENT_FIELD_COORDINATE_MAP = PROF_DOC_CONFIG.get('DOCUMENT_FIELD_COORDINATE_MAP')
    DOCUMENT_PROFESSIONAL_MAP = PROF_DOC_CONFIG.get('DOCUMENT_PROFESSIONAL_MAP')
    TTF_PATH = TTF_PATH


class DocumentFiller:
    def __init__(self, document_type: ProjectDocumentType, professionals: list[Professional],
                 team_members: list[ProjectTeamMember], src_pdf_path: str):
        self.document_positions = DocumentMap.DOCUMENT_FIELD_COORDINATE_MAP.get(document_type.name, {})
        self.team_members = team_members
        self.permit_owner = next((member for member in team_members if member.role == ProjectTeamRole.PERMIT_OWNER), None)
        self.doc_required_members = professionals + team_members
        self.src_pdf_path = src_pdf_path
        self.output_pdf_path = os.path.join(DOCUMENTS_FOLDER, f"filled_{document_type.value}.pdf")

    def fill_document(self):
        # Read the original PDF first to get actual page sizes
        reader = PdfReader(self.src_pdf_path)
        writer = PdfWriter()
        
        page_numbers = list(self.document_positions.keys())
        font_path = TTF_PATH
        pdfmetrics.registerFont(TTFont("ArialHebrew", font_path))
        
        # Process each page individually to match exact dimensions
        for i, page in enumerate(reader.pages):
            # Get the actual page dimensions
            page_width = float(page.mediabox.width)
            page_height = float(page.mediabox.height)
            
            # Create a separate canvas for each page with exact dimensions
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=(page_width, page_height))
            can.setFont("ArialHebrew", 12)
            
            # Set transparent drawing mode
            can.setFillColorRGB(0, 0, 0)  # Black text
            can.setStrokeColorRGB(0, 0, 0)  # Black stroke
            
            # Fill this specific page if it has position data
            if (i + 1) in page_numbers:  # page_numbers are 1-indexed
                self.fill_page(can, i + 1)
            
            can.save()
            packet.seek(0)
            
            # Create overlay PDF for this page
            overlay_pdf = PdfReader(packet)
            
            # Merge the overlay onto the original page
            if len(overlay_pdf.pages) > 0:
                page.merge_page(overlay_pdf.pages[0])
            
            writer.add_page(page)

        # Save the modified PDF
        with open(self.output_pdf_path, "wb") as output_file:
            writer.write(output_file)

        return self.output_pdf_path
    
    def draw_text_safe(self, can: canvas.Canvas, x: int, y: int, text: str, is_hebrew: bool = True):
        """Safely draw text with proper formatting to avoid white background issues"""
        if not text or str(text).strip() == "":
            return
        
        # Save current graphics state
        can.saveState()
        
        # Ensure colors are set correctly for each text draw
        can.setFillColorRGB(0, 0, 0)  # Black text
        can.setStrokeColorRGB(0, 0, 0)  # Black stroke
        
        # Convert to string and strip whitespace
        text_str = str(text).strip()
        
        # Handle Hebrew text direction
        if is_hebrew and any(ord(c) > 127 for c in text_str):  # Contains non-ASCII (Hebrew) characters
            display_text = text_str[::-1]  # Reverse for Hebrew
        else:
            display_text = text_str
            
        try:
            can.drawString(x, y, display_text)
        except Exception as e:
            # Fallback: draw without special formatting if there's an encoding issue
            can.drawString(x, y, text_str)
        finally:
            # Restore graphics state
            can.restoreState()
    
    def fill_page(self,can: canvas.Canvas,page_number: int):    
        for required_member in self.doc_required_members:
            prefix = required_member.role.name.lower()
            
            ## Professional Data
            if self.document_positions[page_number].get(f"{prefix}_name"):
                self.draw_text_safe(can, *self.document_positions[page_number][f"{prefix}_name"], required_member.name, is_hebrew=True)
            if self.document_positions[page_number].get(f"{prefix}_id"):
                self.draw_text_safe(can, *self.document_positions[page_number][f"{prefix}_id"], required_member.national_id, is_hebrew=False)
            if self.document_positions[page_number].get(f"{prefix}_address"):
                self.draw_text_safe(can, *self.document_positions[page_number].get(f"{prefix}_address"), required_member.address, is_hebrew=True)
            if self.document_positions[page_number].get(f"{prefix}_phone"):
                self.draw_text_safe(can, *self.document_positions[page_number][f"{prefix}_phone"], required_member.phone, is_hebrew=False)
            if self.document_positions[page_number].get(f"{prefix}_mail"):
                self.draw_text_safe(can, *self.document_positions[page_number][f"{prefix}_mail"], required_member.email, is_hebrew=False)
            if self.document_positions[page_number].get(f"{prefix}_license_number"):
                self.draw_text_safe(can, *self.document_positions[page_number].get(f"{prefix}_license_number"), required_member.license_number, is_hebrew=False)
            if self.document_positions[page_number].get(f"{prefix}_license_expiration_date"):
                self.draw_text_safe(can, *self.document_positions[page_number].get(f"{prefix}_license_expiration_date"), required_member.license_expiration_date.strftime("%d/%m/%Y"), is_hebrew=False)
            
            ## Professional Signature Area
            if self.document_positions[page_number].get(f"{prefix}_name_for_signed"):
                self.draw_text_safe(can, *self.document_positions[page_number].get(f"{prefix}_name_for_signed"), required_member.name, is_hebrew=True)
            if self.document_positions[page_number].get(f"{prefix}_id_for_signed"):
                self.draw_text_safe(can, *self.document_positions[page_number].get(f"{prefix}_id_for_signed"), required_member.national_id, is_hebrew=False)

            ## Date for Signed
            if self.document_positions[page_number].get(f"date_for_signed"):
                self.draw_text_safe(can, *self.document_positions[page_number].get(f"date_for_signed"), datetime.now().strftime("%d/%m/%Y"), is_hebrew=False)
            if self.document_positions[page_number].get(f"date"):
                self.draw_text_safe(can, *self.document_positions[page_number].get(f"date"), datetime.now().strftime("%d/%m/%Y"), is_hebrew=False)
  

