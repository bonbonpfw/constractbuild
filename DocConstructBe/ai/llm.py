import os
import logging
import re
import json
from langchain_anthropic import ChatAnthropic
from dotenv import load_dotenv
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

License text:
{license_text}

if there is text_already_extracted, do a deep double check before overwrite it.
{text_already_extracted}

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



class PromptCreator:
    def __init__(self):
        self.claude = self.init_models()

    def init_models(self):
        api_key = os.getenv("CLAUDE_API_KEY")
        model_name = os.getenv('CLAUDE_MODEL_NAME', 'claude-3-5-sonnet-20240620')
        logging.info(f"Using model: {model_name}")
        logging.info(f"Using api_key: {api_key}")
        claude = ChatAnthropic(temperature=0.4, api_key=api_key, model_name=model_name)
        return claude

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
    
