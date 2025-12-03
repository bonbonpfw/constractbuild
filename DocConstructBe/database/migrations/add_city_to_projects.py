from typing import List
from sqlalchemy import inspect, text

import os
import uuid
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, scoped_session, sessionmaker
from sqlalchemy import String


def get_db_conn_string():
    if os.environ.get('DATABASE_URL'):
        return os.environ.get('DATABASE_URL')
    db_name = os.environ.get('DB_NAME','docconstruct')
    host = os.environ.get('DB_HOST','localhost')
    port = os.environ.get('DB_PORT','5432')
    user = os.environ.get('DB_USER','postgres')
    password = os.environ.get('DB_PASS','postgres')
    
    # Handle None port value
    if port == 'None' or port is None:
        port = '5432'  # Use default PostgreSQL port
        
    return f'postgresql://{user}:{password}@{host}:{port}/{db_name}'


@contextmanager
def session_scope(engine):
    """Provide a transactional scope around a series of operations."""
    session = Session(bind=engine)
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


engine = create_engine(
    get_db_conn_string(),
    echo=False,
    pool_pre_ping=True,
    pool_size=200,
    max_overflow=0
)


db_session = scoped_session(
    sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )
)


class UUID_F(String):
    UUID_SIZE = 36

    def __init__(self):
        super().__init__(self.UUID_SIZE)

    @staticmethod
    def uuid_allocator():
        return str(uuid.uuid4())



def migrate_add_city_to_projects() -> None:
    with engine.begin() as connection:
        inspector = inspect(connection)
        existing_columns: List[str] = [col["name"] for col in inspector.get_columns("projects")]

        if "city" in existing_columns:
            return

        connection.execute(text("ALTER TABLE projects ADD COLUMN city VARCHAR"))
        connection.execute(text("UPDATE projects SET city = 'TelAviv' WHERE city IS NULL"))
        connection.execute(text("ALTER TABLE projects ALTER COLUMN city SET NOT NULL"))


if __name__ == "__main__":
    migrate_add_city_to_projects()
    print("Migration complete: added NOT NULL 'city' to 'projects' with default 'TLV' for existing rows.")


