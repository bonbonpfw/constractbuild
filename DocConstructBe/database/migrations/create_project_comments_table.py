from typing import List
from sqlalchemy import inspect, text

from database.database import engine


def upgrade() -> None:
    """Create the project_comments table if it does not exist."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        existing_tables: List[str] = inspector.get_table_names()

        if "project_comments" in existing_tables:
            return

        connection.execute(text("""
            CREATE TABLE public.project_comments (
                id character varying(36) NOT NULL,
                project_id character varying(36) NOT NULL,
                author_user_id character varying(36) NOT NULL,
                content character varying NOT NULL,
                created_at timestamp without time zone NOT NULL,
                updated_at timestamp without time zone NOT NULL
            )
        """))
        connection.execute(text("""
            ALTER TABLE ONLY public.project_comments
                ADD CONSTRAINT project_comments_pkey PRIMARY KEY (id)
        """))
        connection.execute(text("""
            ALTER TABLE ONLY public.project_comments
                ADD CONSTRAINT project_comments_author_user_id_fkey FOREIGN KEY (author_user_id)
                    REFERENCES public.users(id);
        """))
        connection.execute(text("""
            ALTER TABLE ONLY public.project_comments
                ADD CONSTRAINT project_comments_project_id_fkey FOREIGN KEY (project_id)
                    REFERENCES public.projects(id);
        """))


if __name__ == "__main__":
    upgrade()
    print("Migration complete: Project Comments table created.")
