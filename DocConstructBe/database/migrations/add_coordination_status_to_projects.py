"""
Migration script to add coordination_status and coordination_target_date columns to projects table.
Run this script directly with Python to apply the migration.
"""

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from database.database import engine


def upgrade():
    """Add coordination_status and coordination_target_date fields to projects table."""
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS coordination_status VARCHAR;
        """))
        conn.execute(text("""
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS coordination_target_date DATE;
        """))
        conn.commit()
    print("Migration complete: Added coordination_status and coordination_target_date columns to projects table")


def downgrade():
    """Remove coordination_status and coordination_target_date fields from projects table."""
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE projects 
            DROP COLUMN IF EXISTS coordination_status;
        """))
        conn.execute(text("""
            ALTER TABLE projects 
            DROP COLUMN IF EXISTS coordination_target_date;
        """))
        conn.commit()
    print("Rollback complete: Removed coordination_status and coordination_target_date columns from projects table")


if __name__ == "__main__":
    upgrade()
