from dotenv import load_dotenv
load_dotenv()

from typing import List
from sqlalchemy import inspect, text
from database.database import engine


def upgrade() -> None:
    with engine.begin() as connection:
        inspector = inspect(connection)
        existing_columns: List[str] = [col["name"] for col in inspector.get_columns("projects")]

        if "city" in existing_columns:
            return

        connection.execute(text("ALTER TABLE projects ADD COLUMN city VARCHAR"))
        connection.execute(text("UPDATE projects SET city = 'TelAviv' WHERE city IS NULL"))
        connection.execute(text("ALTER TABLE projects ALTER COLUMN city SET NOT NULL"))


if __name__ == "__main__":
    upgrade()
    print("Migration complete: added NOT NULL 'city' to 'projects' with default 'TLV' for existing rows.")


