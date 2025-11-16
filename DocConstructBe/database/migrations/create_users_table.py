from typing import List
from sqlalchemy import inspect, text

from DocConstructBe.database.database import engine


def upgrade() -> None:
    """Create the users table if it does not exist."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        existing_tables: List[str] = inspector.get_table_names()

        if "users" in existing_tables:
            return

        connection.execute(text("""
            CREATE TABLE public.users (
                id character varying(36) NOT NULL,
                username character varying NOT NULL,
                hashed_password character varying NOT NULL,
                is_active boolean NOT NULL,
                created_at timestamp without time zone NOT NULL,
                updated_at timestamp without time zone NOT NULL
            )
        """))
        connection.execute(text("""
            ALTER TABLE ONLY public.users
                ADD CONSTRAINT users_pkey PRIMARY KEY (id)
        """))
        connection.execute(text("""
            ALTER TABLE ONLY public.users
                ADD CONSTRAINT users_username_key UNIQUE (username)
        """))


if __name__ == "__main__":
    upgrade()
    print("Migration complete: Users table created.")
