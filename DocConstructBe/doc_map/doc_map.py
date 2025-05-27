from data_model.enum import ProjectDocumentType
from data_model.models import Professional, PermitOwner
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
                 permit_owner: PermitOwner, src_pdf_path: str):
        self.document_positions = DocumentMap.DOCUMENT_FIELD_COORDINATE_MAP.get(document_type.name, {})
        self.permit_owner = permit_owner
        self.professionals = professionals
        self.src_pdf_path = src_pdf_path
        self.output_pdf_path = os.path.join(DOCUMENTS_FOLDER, f"filled_{document_type.value}.pdf")

    def fill_document(self):
        packet = io.BytesIO()
        page_numbers = list(self.document_positions.keys())
        font_path = TTF_PATH
        pdfmetrics.registerFont(TTFont("ArialHebrew", font_path))
        can = canvas.Canvas(packet, pagesize=letter)
        can.setFont("ArialHebrew", 12)
        
        for page_number in page_numbers:
            can.setFont("ArialHebrew", 12)
            self.fill_page(can, page_number)
            can.showPage()
        can.save()

        packet.seek(0)

        # Read the temporary PDF
        text_pdf = PdfReader(packet)

        # Read the original PDF
        reader = PdfReader(self.src_pdf_path)
        writer = PdfWriter()

        # Merge the text onto the first page (or specify page)
        for i, page in enumerate(reader.pages):
            if i < len(text_pdf.pages):  # Ensure we do not go out of range
                page.merge_page(text_pdf.pages[i])
            writer.add_page(page)

        # Save the modified PDF
        with open(self.output_pdf_path, "wb") as output_file:
            writer.write(output_file)

        return self.output_pdf_path
    
    def fill_page(self,can: canvas.Canvas,page_number: int):    
        for professional in self.professionals:
            if self.document_positions[page_number].get("name"):
                can.drawString(*self.document_positions[page_number]["name"], professional.name[::-1])
            if self.document_positions[page_number].get("id"):
                can.drawString(*self.document_positions[page_number]["id"], professional.national_id)
            if self.document_positions[page_number].get("phone"):
                can.drawString(*self.document_positions[page_number]["phone"], professional.phone)
            if self.document_positions[page_number].get("address"):
                can.drawString(*self.document_positions[page_number]["address"], professional.address[::-1])
            if self.document_positions[page_number].get("mail"):
                can.drawString(*self.document_positions[page_number]["mail"], professional.email)
            if self.document_positions[page_number].get("license_number"):
                can.drawString(*self.document_positions[page_number].get("license_number"), professional.license_number)
            if self.document_positions[page_number].get("date"):
                can.drawString(*self.document_positions[page_number]["date"], datetime.now().strftime("%d/%m/%Y"))
            if self.document_positions[page_number].get("prof_name_for_signed"):
                can.drawString(*self.document_positions[page_number]["prof_name_for_signed"], professional.name[::-1])
            if self.document_positions[page_number].get("license_expiration_date"):
                can.drawString(*self.document_positions[page_number]["license_expiration_date"], professional.license_expiration_date.strftime("%d/%m/%Y"))
            if self.document_positions[page_number].get("date_for_signed"):
                can.drawString(*self.document_positions[page_number]["date_for_signed"], datetime.now().strftime("%d/%m/%Y"))
            if self.document_positions[page_number].get("permit_owner"):
                can.drawString(*self.document_positions[page_number]["permit_owner"], self.permit_owner.name[::-1])
            if self.document_positions[page_number].get("permit_owner_name_for_signed"):
                can.drawString(*self.document_positions[page_number]["permit_owner_name_for_signed"], self.permit_owner.name[::-1])
            if self.document_positions[page_number].get("permit_number_for_signed") and self.permit_owner.signature_file_path:
                can.drawString(*self.document_positions[page_number]["permit_number_for_signed"], self.permit_owner.signature_file_path)
            if self.document_positions[page_number].get("id_for_signed"):
                can.drawString(*self.document_positions[page_number]["id_for_signed"], professional.national_id)
            if self.document_positions[page_number].get("name_for_signed"):
                can.drawString(*self.document_positions[page_number]["name_for_signed"], professional.name[::-1])
            if self.document_positions[page_number].get("date_for_prof_signed"):
                can.drawString(*self.document_positions[page_number]["date_for_prof_signed"], datetime.now().strftime("%d/%m/%Y"))