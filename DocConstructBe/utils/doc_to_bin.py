
import pdf2image 
import PyPDF2
import pytesseract
from PIL import Image
from pdfminer.high_level import extract_text

def process_image_to_binary(image_path: str) -> str:
    """
    Extracts text from an image using Tesseract OCR.
    :param image_path: Path to the JPG image
    :return: Extracted text
    """
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, lang='heb')
        return text
    except Exception as e:
        print(f"שגיאה בחילוץ טקסט: {e}")
        return ""
    
def process_pdf_to_binary(pdf_path):
    # Open and extract text from the PDF
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text()
    return full_text


def process_pdf_image_to_binary(pdf_file: str) -> None:
    images = pdf2image.convert_from_path(pdf_file)

    # Extract text with Hebrew support
    text = ""
    for image in images:
        text += pytesseract.image_to_string(image, lang="heb")
    
    return text
    


