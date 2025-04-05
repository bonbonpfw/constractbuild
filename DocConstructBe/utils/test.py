from DocConstructBe.utils.data_extract import ExtractProfessional
from DocConstructBe.utils.doc_to_bin import process_pdf_to_binary, process_image_to_binary


root_path = "/home/ubuntu/pr_repo/constractbuild/test"
import os

def process_documents_in_root(root_path: str) -> None:
    for root, _, files in os.walk(root_path):
        for file in files:
            
            file_path = os.path.join(root, file)
            if file.lower().endswith('.pdf'):
                continue
                binary_data = process_pdf_to_binary(file_path)
                extract_professional = ExtractProfessional(binary_data)
                extract_professional.extract_data()
                print(f"Processed PDF: {file_path}")
            elif file.lower().endswith('.jpeg') or file.lower().endswith('.jpg'):
                binary_data = process_image_to_binary(file_path)
                extract_professional = ExtractProfessional(binary_data)
                extract_professional.extract_from_image()
                print(f"Processed Image: {file_path}")

          
            print(extract_professional.professional)

process_documents_in_root(root_path)
