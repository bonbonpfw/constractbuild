#!/bin/bash

# Get server IP address
if command -v ip &> /dev/null; then
    SERVER_IP=$(ip -4 addr show scope global | grep -oP '(?<=inet\s)[\d.]+' | head -n 1)
elif command -v ifconfig &> /dev/null; then
    SERVER_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
else
    SERVER_IP="localhost"
    echo "Warning: Unable to determine server IP address. Using 'localhost' instead."
fi

# Export the SERVER_IP environment variable
export SERVER_IP
echo "Using server IP: $SERVER_IP"

# Make scripts executable
chmod +x generate-certs.sh

# Run certificate generation script
./generate-certs.sh

# Start Docker Compose in detached mode
echo "Starting Docker Compose..."
docker compose up -d --build

echo "Application is starting..."
echo "Frontend should be available at: http://$SERVER_IP"
echo "Backend API should be available at: http://$SERVER_IP/api"
echo ""
echo "To view logs, run: docker compose logs -f"
echo "To stop the application, run: docker compose down" 
