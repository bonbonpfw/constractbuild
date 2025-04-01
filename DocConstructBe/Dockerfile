# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Create the data directory and set permissions
RUN mkdir -p /app/data/files /app/data/reports /app/data/dbs && \
    chmod 777 -R /app/data

# Copy only the requirements.txt first to leverage Docker cache
COPY requirements.txt ./

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt  && \
pip install gunicorn

# Copy the backend application code to the container
COPY . .

# Expose the port the app runs on
EXPOSE 5001

# Define environment variable for the Flask application
ENV FLASK_APP=run.py

# Add the backend directory to PYTHONPATH
ENV PYTHONPATH=/app:$PYTHONPATH

# Command to run the Flask application
#CMD ["flask", "run", "--host=0.0.0.0", "--port=5001"]
CMD ["gunicorn", "--preload", "--bind", "0.0.0.0:5001", "--workers", "2", "--threads", "2", "run:app"]

