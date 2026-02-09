import os
from sqlalchemy import inspect, text, create_engine

# Load environment variables from .env file if it exists
from dotenv import load_dotenv
load_dotenv()

def get_db_conn_string():
    if os.environ.get('DATABASE_URL'):
        return os.environ.get('DATABASE_URL')
    db_name = os.environ.get('DB_NAME','doc_construct')
    host = os.environ.get('DB_HOST','localhost')
    port = os.environ.get('DB_PORT','5432')
    user = os.environ.get('DB_USER','postgres')
    password = os.environ.get('DB_PASS','postgres')
    
    # Handle None port value
    if port == 'None' or port is None:
        port = '5432'
        
    return f'postgresql://{user}:{password}@{host}:{port}/{db_name}'

engine = create_engine(
    get_db_conn_string(),
    echo=False,
    pool_pre_ping=True,
    pool_size=200,
    max_overflow=0
)


def upgrade() -> None:
    """Update project_comments.author_user_id to be nullable and add ON DELETE SET NULL."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        existing_tables = inspector.get_table_names()

        if "project_comments" not in existing_tables:
            return

        # Drop the existing foreign key constraint
        connection.execute(text("""
            ALTER TABLE public.project_comments
            DROP CONSTRAINT IF EXISTS project_comments_author_user_id_fkey;
        """))

        # Alter the column to be nullable
        connection.execute(text("""
            ALTER TABLE public.project_comments
            ALTER COLUMN author_user_id DROP NOT NULL;
        """))

        # Recreate the foreign key constraint with ON DELETE SET NULL
        connection.execute(text("""
            ALTER TABLE ONLY public.project_comments
            ADD CONSTRAINT project_comments_author_user_id_fkey 
            FOREIGN KEY (author_user_id)
            REFERENCES public.users(id)
            ON DELETE SET NULL;
        """))


if __name__ == "__main__":
    upgrade()
    print("Migration complete: Project Comments author_user_id is now nullable with ON DELETE SET NULL.")
