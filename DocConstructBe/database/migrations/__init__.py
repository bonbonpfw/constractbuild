import os
import importlib
import logging

logger = logging.getLogger(__name__)


def run_all_migrations():
    """
    Run all migration files in the migrations folder.
    Each migration file should have either an 'upgrade()' function 
    or a function starting with 'migrate_'.
    """
    migrations_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Get all Python files in the migrations directory (excluding __init__.py)
    migration_files = sorted([
        f[:-3] for f in os.listdir(migrations_dir)
        if f.endswith('.py') and f != '__init__.py'
    ])
    
    logger.info(f"Found {len(migration_files)} migration files to run")
    
    for migration_name in migration_files:
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
            for attr_name in dir(module):
                if attr_name.startswith('migrate_') and callable(getattr(module, attr_name)):
                    logger.info(f"Running migration: {migration_name} ({attr_name})")
                    getattr(module, attr_name)()
                    migration_ran = True
                    break
            
            if migration_ran:
                logger.info(f"Migration completed: {migration_name}")
            else:
                logger.warning(f"No migration function found in: {migration_name}")
                
        except Exception as e:
            logger.error(f"Error running migration {migration_name}: {e}")
            # Continue with other migrations even if one fails
            continue
    
    logger.info("All migrations completed")
