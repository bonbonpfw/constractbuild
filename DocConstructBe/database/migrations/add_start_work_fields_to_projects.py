"""
Migration script to add start_work_status, start_work_date, start_work_target columns to projects table.
Run this script directly with Python to apply the migration.
"""

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from database.database import engine


def upgrade():
    """Add start work fields to projects table."""
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS start_work_status VARCHAR;
        """))
        conn.execute(text("""
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS start_work_date DATE;
        """))
        conn.execute(text("""
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS start_work_target DATE;
        """))
        conn.commit()
    print("Migration complete: Added start_work_status, start_work_date, start_work_target columns to projects table")


def downgrade():
    """Remove start work fields from projects table."""
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE projects 
            DROP COLUMN IF EXISTS start_work_status;
        """))
        conn.execute(text("""
            ALTER TABLE projects 
            DROP COLUMN IF EXISTS start_work_date;
        """))
        conn.execute(text("""
            ALTER TABLE projects 
            DROP COLUMN IF EXISTS start_work_target;
        """))
        conn.commit()
    print("Rollback complete: Removed start_work_status, start_work_date, start_work_target columns from projects table")


if __name__ == "__main__":
    upgrade()
