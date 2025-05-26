import os
from flask import Flask

from config.sys_config import DOCUMENTS_FOLDER
from data_model.models import init_tables
from app.errors import handle_error
from flask_executor import Executor



# Create executor instance at module level
executor = Executor()


def create_app():
    # global celery
    app = Flask(__name__)
    
    # Initialize executor with app
    executor.init_app(app)
    
    app.config.update(
        DOCUMENTS_FOLDER=DOCUMENTS_FOLDER,

    )
    init_tables()

    app.register_error_handler(code_or_exception=Exception, f=handle_error)

    with app.app_context():
        from .routes import init_routes
        init_routes(app)

        # Create necessary directories
        directories = [DOCUMENTS_FOLDER]
        for directory in directories:
            os.makedirs(directory, exist_ok=True)


    return app
