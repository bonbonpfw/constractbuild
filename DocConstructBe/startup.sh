#!/bin/bash

echo "Backend starting up..."
echo "Flask App: $FLASK_APP"
echo "Flask Environment: $FLASK_ENV"
echo "OpenAI API Key is set: $(if [ -n "$OPENAI_API_KEY" ]; then echo "Yes"; else echo "No"; fi)"
echo "Model Name: $MODEL_NAME"

flask run --host=0.0.0.0 --port=5001 