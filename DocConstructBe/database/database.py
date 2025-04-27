import os
import uuid
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, scoped_session, sessionmaker
from sqlalchemy import String


def get_db_conn_string():
    if os.environ.get('DATABASE_URL'):
        return os.environ.get('DATABASE_URL')
    db_name = os.environ.get('DB_NAME')
    host = os.environ.get('DB_HOST')
    port = os.environ.get('DB_PORT')
    user = os.environ.get('DB_USER')
    password = os.environ.get('DB_PASS')
    
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
