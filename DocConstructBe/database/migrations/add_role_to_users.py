from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import inspect, text
from database.database import engine


def upgrade() -> None:
    """Add role column to the users table."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        existing_columns = [col["name"] for col in inspector.get_columns("users")]

        if "role" in existing_columns:
            return

        connection.execute(text("""
            ALTER TABLE public.users
                ADD COLUMN role character varying NOT NULL DEFAULT 'admin'
        """))


if __name__ == "__main__":
    upgrade()
    print("Migration complete: role column added to users table.")
