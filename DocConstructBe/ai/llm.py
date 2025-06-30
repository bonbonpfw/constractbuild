import base64
import os
import logging
import re
import json
from langchain_anthropic import ChatAnthropic
import anthropic
from dotenv import load_dotenv
import pdf2image
import io


logging.basicConfig(level=logging.INFO)

load_dotenv()

FieldNames = [
    "name",
    "id_number",
    "email",
    "phone",
    "address",
    "license_number",
    "license_expiration_date",
    "professional_type"
]
Prompt = """

You are an expert at extracting information from Hebrew professional licenses.
all information info have to be aligend with Israel start like phone number (9 digits) address etc.

Extract ONLY the following information from the license text. If information is not found, use null.

E.G in this text:  24052 מ"בע בבניה אחריות גוטליב 512723875
05012004 5400804      שמואל  גבעת     1 הערבה
        
 5 ג   בניה 100 =
33900374 האני ברנסי  1519495 אריה גוטליב  
  מקצועיים מנהליםעובדים העסקת תנאי על רשום = 
  
 
24112024  
לתשלום לא
30238944
                                                       
 31 דצמבר 2026 הקבלנים בפנקס  בו שחלו שינויים  או הרשיון תוקף  את לוודא  יש. החוק בהוראות  בעמידה ומותנה האגרה תשלום מיום הרשיון תוקף. 1
 רשם ידי על המתפרסמות בהודעות ולעיין www.moch.gov.il  האינטרנט  באתר  הקבלנים בפנקס גם לעיין ניתן, הקבלנים רשם במשרד
.הקבלנים

we have :
שם: גוטליב אריה
ח.פ/ ת.ז.: 512723875
כתובת: הערבה 1 גבעת שמואל 5400804
רישיון מקצועי: 24052
תוקף: 2026-12-31
סוג: קבלן בניה


Return JSON format:
{{
  "name": "<Full name of the professional>",
  "id_number": "<8-9-digit ID number (ת.ז.)>",
  "email": "<Email address>",
  "phone": "<Phone number>", 
  "address": "<Full address>",
  "license_number": "<Professional license number>",
  "license_expiration_date": "<Expiration date in YYYY-MM-DD format (e.g., 2025-01-01)>",
  "professional_type": "<Type of profession (e.g., קבלן בניה, אדריכל, etc.)>"
}}

IMPORTANT:
- Extract ONLY what appears in the text
- Use null if information is missing
- Format dates as YYYY-MM-DD
- Return ONLY the JSON object
"""


class LLM:
    def __init__(self, model_name=None):
        self.claude = self.init_models(model_name)

    def init_models(self,model_name):
        api_key = os.getenv("CLAUDE_API_KEY")
        if not api_key:
            raise ValueError("CLAUDE_API_KEY environment variable is not set")
        if not model_name:
            model_name = os.getenv('CLAUDE_MODEL_NAME', 'claude-3-5-sonnet-20240620')
        logging.info(f"Using model: {model_name}")
        claude = anthropic.Anthropic(api_key=api_key)
        return claude
    
    def run_openai_prompt(self, prompt):
        return self.claude.invoke(prompt)


class PromptCreator:
    def __init__(self):
        self.claude = LLM().claude

    def run_openai_prompt(self, prompt):
        return self.claude.invoke(prompt)
    
class JSONParserForLLM:

    @staticmethod
    def extract_field(text, field_name):
        """Extract the value of a specific field from the text."""
        # Define a more specific pattern to match the field, handling multi-line values and lists
        pattern = rf'"{field_name}":\s*(\[.*?\]|\{{.*?\}}|".*?"|\d+|true|false|null)(,|\n|$)'
        match = re.search(pattern, str(text), re.DOTALL)

        if not match:
            return None

        extracted_value = match.group(1).strip()

        # Try to parse the extracted value as JSON
        try:
            parsed_value = json.loads(extracted_value)
        except json.JSONDecodeError:
            # If it's not valid JSON, return the string as is, but strip quotes
            parsed_value = extracted_value.strip('"')

        return parsed_value
    
    @staticmethod
    def clean_json_text(text):
        cleaned_text = re.sub(r"```json|```", "", text).strip()
        output = json.loads(cleaned_text)
        return output
    
class LlmLicenseExtractor:
    def __init__(self, model_name=None):
        self.claude = LLM(model_name).claude

    def extract_text_from_license(self, license_path,file_type):
        if file_type == 'pdf':
            pages = pdf2image.convert_from_path(license_path)
            for i,page in enumerate(pages[:1]):
                buffer = io.BytesIO()
                page.save(buffer, format="PNG")
                image_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
                buffer.close()
        if file_type == 'image':
            with open(license_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
        return self.extract_text_from_image(image_data=image_data)
           

    def extract_text_from_image(self, image_data=None):
        extracted_text = self.claude.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=8192,
            messages=[{"role": "user", "content": [{"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": image_data}},
                                                    {"type": "text", "text": Prompt}]}]
            )
        return extracted_text.content[0].text

# text =LlmLicenseExtractor().extract_text_from_license("/home/ubuntu/pr_repo/constractbuild/Docs/ProfDocs/a.jpeg","image")
# for field in FieldNames:
#     txt = JSONParserForLLM().extract_field(text,field)
#     print(txt)
