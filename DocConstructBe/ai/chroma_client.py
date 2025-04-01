import logging
import os
import uuid
from chromadb import PersistentClient
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from data_model.models import Survey
from database.database import db_session


class ChromaDbClient:
    """Client for handling Chroma DB operations on question embeddings."""

    def __init__(self, db_path: str):
        self.client = PersistentClient(path=db_path)
        self.embeddings = OpenAIEmbeddingFunction(
            api_key=os.getenv("OPENAI_API_KEY"),
            model_name="text-embedding-ada-002"
        )
        self.collection = self.client.get_or_create_collection(
            name="questions_store",
            embedding_function=self.embeddings
        )

    def add_question(self, survey_id: str, question_text: str):
        """Add a question to the ChromaDB with generated embedding."""
        question_id = str(uuid.uuid4())
        metadata = {"survey_id": survey_id, "question_id": question_id, "question_text": question_text}
        self.collection.add(documents=[question_text], metadatas=[metadata], ids=[f"{survey_id}_{question_id}"])
        logging.info(f"Question '{question_text}' added to survey {survey_id} with ID {question_id}.")

    def question_exists(self, survey_id: str, question_text: str) -> bool:
        """Check if a question exists based on survey and question IDs."""
        result = self.collection.get(where={"$and": [{"survey_id": survey_id}, {"question_text": question_text}]})
        return len(result["documents"]) > 0

    def remove_survey_questions(self, survey_id: str):
        """Remove all questions from the database for a specific survey."""
        self.collection.delete(where={"survey_id": survey_id})
        logging.info(f"All questions from survey {survey_id} were removed from the database.")

    def search_similar_question(self, input_question: str, n_results: int = 30, threshold: float = 0.91) -> list:
        """Search for similar questions in the database with optional similarity threshold."""
        print(
            'input_question:', input_question,
            '\nn_results:', n_results,
            '\nthreshold:', threshold
        )
        results = self.collection.query(
            query_texts=[input_question],
            n_results=n_results,
            include=["metadatas", "documents", "distances"],
        )
        # Filter and return questions based on similarity threshold
        logging.info(f"Found {(results['documents'])} similar questions")
        return [
            {
                "question_text": results["documents"][0][i],
                "survey_id": results["metadatas"][0][i]["survey_id"],
                "similarity": 1 - results["distances"][0][i]
            }
            for i in range(len(results["documents"][0]))
       
        ]


class KnowledgeBaseBuilder:
    """Builds and populates a knowledge base in ChromaDB with survey questions."""

    def __init__(self, db_path: str):
        self.client = ChromaDbClient(db_path=db_path)

    def fetch_surveys_questions(self,survey_id):
        """Fetch all surveys and questions from the database."""
        try:
            surveys = db_session.query(Survey).filter(Survey.survey_project_id == survey_id).all()
            return [
                (survey.survey_project_id, list(survey.survey_metadata['questions'].values()))
                for survey in surveys if survey.survey_metadata and 'questions' in survey.survey_metadata
            ]
        except Exception as e:
            logging.error(f"Error fetching surveys: {e}")
            return []
        finally:
            db_session.close()

    def populate_knowledge_base(self,survey_id):
        logging.info(f"Populating knowledge base for survey ID: {survey_id}")
        survey_questions = self.fetch_surveys_questions(survey_id)
        logging.info(f"Found {len(survey_questions)} questions for survey {survey_id}")
        for survey_id, questions in survey_questions:
            for question_text in questions:
                # Avoid re-embedding if the question already exists
                logging.info(f"Checking if question already exists in survey {survey_id}")
                if not self.client.question_exists(survey_id, question_text):
                    logging.info(f"Question '{question_text}' does not exist")
                    self.client.add_question(survey_id, question_text)
