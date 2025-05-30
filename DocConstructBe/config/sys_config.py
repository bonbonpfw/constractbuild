import os
import yaml
import logging

from dotenv import load_dotenv

load_dotenv()

# Set up base application path using environment variables with a default value
# APP_PATH = "/home/ubuntu/doc-construct/"
#APP_CODE = 'DocConstructBe'
APP_PATH = os.getenv('APP_PATH')
APP_CODE = '/app'

DOCUMENTS_FOLDER = os.path.join(APP_PATH, "documents")

CONFIG = os.path.join(APP_CODE, "config")
TTF_PATH = os.path.join(CONFIG, "Alef-Regular.ttf")

CONFIG_FALLBACK = os.path.join(CONFIG,"config.yaml")

PROF_DOC_CONFIG = os.path.join(CONFIG, "prof_doc.yaml")

# Set up logging
logging.basicConfig(level=logging.INFO)

def get_host_path(container_path):
    if container_path.startswith(APP_PATH):
        relative_path = os.path.relpath(container_path, APP_PATH)
        return os.path.join("/home/ubuntu/docconstruct", relative_path)
    elif container_path.startswith(APP_CODE):
        relative_path = os.path.relpath(container_path, APP_CODE)
        return os.path.join("/home/ubuntu/DocConstructBe", relative_path)
    else:
        return "Unknown host path"

def get_config(config_file=CONFIG):
    script_dir = os.path.dirname(os.path.realpath(__file__))
    config_file = os.path.join(script_dir, config_file)
    if os.path.exists(CONFIG_FALLBACK):
        config_file = CONFIG_FALLBACK
    with open(config_file, 'r') as file:
        config = yaml.safe_load(file)
    return config
