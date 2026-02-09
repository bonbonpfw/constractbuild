"""
Migration script to add eng_coord_contact_name column to projects table.
Run this script directly with Python to apply the migration.
"""

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from database.database import engine


def upgrade():
    """Add eng_coord_contact_name field to projects table."""
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS eng_coord_contact_name VARCHAR;
        """))
        conn.commit()
    print("Migration complete: Added eng_coord_contact_name column to projects table")


def downgrade():
    """Remove eng_coord_contact_name field from projects table."""
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE projects 
            DROP COLUMN IF EXISTS eng_coord_contact_name;
        """))
        conn.commit()
    print("Rollback complete: Removed eng_coord_contact_name column from projects table")


if __name__ == "__main__":
    upgrade()
