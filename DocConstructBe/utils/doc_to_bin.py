import PyPDF2
import pytesseract
from PIL import Image
import pdfplumber
import os

def process_image_to_binary(image_path: str) -> str:
    """
    Extracts text from an image using Tesseract OCR.
    :param image_path: Path to the JPG image
    :return: Extracted text
    """
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, lang='heb')
        binary_data = text.encode('utf-8')
        return binary_data#text.strip()
    except Exception as e:
        print(f"שגיאה בחילוץ טקסט: {e}")
        return ""
    
def process_pdf_to_binary(pdf_file: str) -> None:
    reader = PyPDF2.PdfReader(pdf_file)
    extracted_text_pdf = ""
    for page in reader.pages:
        extracted_text_pdf += page.extract_text() + "\n"

    # המרה ל-binary לצורך העברה לפונקציה
    binary_data = extracted_text_pdf.encode('utf-8')
    return binary_data



