class DatabaseExtension:
    def __init__(self, microservice, db_session):
        self.db_session = db_session
        microservice.teardown_appcontext(self.shutdown_session)

    def shutdown_session(self, exception=None):
        self.db_session.remove()
