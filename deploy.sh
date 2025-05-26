#!/bin/bash

# Make scripts executable
chmod +x generate-certs.sh

# Run certificate generation script
./generate-certs.sh

# Start Docker Compose in detached mode
echo "Starting Docker Compose..."
docker compose up -d --build

echo "Application is starting..."
echo "Frontend should be available at: https://localhost"
echo "Backend API should be available at: http://localhost/api"
echo ""
echo "To view logs, run: docker compose logs -f"
echo "To stop the application, run: docker compose down" 