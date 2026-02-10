import os
import importlib
import logging
from datetime import datetime

from sqlalchemy import text, inspect
from database.database import engine

logger = logging.getLogger(__name__)


def _ensure_migrations_table():
    """Create the schema_migrations table if it doesn't exist."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        existing_tables = inspector.get_table_names()
        
        if "schema_migrations" not in existing_tables:
            connection.execute(text("""
                CREATE TABLE schema_migrations (
                    id SERIAL PRIMARY KEY,
                    migration_name VARCHAR(255) NOT NULL UNIQUE,
                    executed_at TIMESTAMP NOT NULL DEFAULT NOW()
                )
            """))
            logger.info("Created schema_migrations table")


def _is_migration_executed(migration_name: str) -> bool:
    """Check if a migration has already been executed."""
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT 1 FROM schema_migrations WHERE migration_name = :name"),
            {"name": migration_name}
        )
        return result.fetchone() is not None


def _record_migration(migration_name: str):
    """Record that a migration has been executed."""
    with engine.begin() as connection:
        connection.execute(
            text("INSERT INTO schema_migrations (migration_name, executed_at) VALUES (:name, :executed_at)"),
            {"name": migration_name, "executed_at": datetime.now()}
        )


def run_all_migrations():
    """
    Run all migration files in the migrations folder.
    Each migration file should have either an 'upgrade()' function 
    or a function starting with 'migrate_'.
    Tracks executed migrations in schema_migrations table.
    """
    # Ensure tracking table exists
    _ensure_migrations_table()
    
    migrations_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Get all Python files in the migrations directory (excluding __init__.py)
    migration_files = sorted([
        f[:-3] for f in os.listdir(migrations_dir)
        if f.endswith('.py') and f != '__init__.py'
    ])
    
    logger.info(f"Found {len(migration_files)} migration files")
    
    for migration_name in migration_files:
        # Skip if already executed
        if _is_migration_executed(migration_name):
            logger.info(f"Skipping already executed migration: {migration_name}")
            continue
            
        try:
            # Import the migration module
            module = importlib.import_module(f'.{migration_name}', package='database.migrations')
            
            # Try to find and run the migration function
            migration_ran = False
            
            # First, try 'upgrade' function
            if hasattr(module, 'upgrade'):
                logger.info(f"Running migration: {migration_name} (upgrade)")
                module.upgrade()
                migration_ran = True
            
            # Then, try functions starting with 'migrate_'
            if not migration_ran:
                for attr_name in dir(module):
                    if attr_name.startswith('migrate_') and callable(getattr(module, attr_name)):
                        logger.info(f"Running migration: {migration_name} ({attr_name})")
                        getattr(module, attr_name)()
                        migration_ran = True
                        break
            
            if migration_ran:
                _record_migration(migration_name)
                logger.info(f"Migration completed and recorded: {migration_name}")
            else:
                logger.warning(f"No migration function found in: {migration_name}")
                
        except Exception as e:
            logger.error(f"Error running migration {migration_name}: {e}")
            # Continue with other migrations even if one fails
            continue
    
    logger.info("All migrations completed")
