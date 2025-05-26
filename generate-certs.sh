#!/bin/bash

mkdir -p certs

# Check if certificates already exist
if [ -f "certs/cert.pem" ] && [ -f "certs/key.pem" ]; then
    echo "Certificates already exist in the certs directory."
else
    echo "Generating self-signed certificates for local development..."
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout certs/key.pem -out certs/cert.pem \
      -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
      -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    
    # Set permissions
    chmod 600 certs/key.pem
    chmod 600 certs/cert.pem
    
    echo "Certificates generated successfully."
fi

# Create postgres.conf if it doesn't exist
if [ ! -f "postgres.conf" ]; then
    echo "Creating default postgres.conf file..."
    cat > postgres.conf << 'EOF'
# Basic PostgreSQL configuration file
max_connections = 100
shared_buffers = 128MB
dynamic_shared_memory_type = posix
max_wal_size = 1GB
min_wal_size = 80MB
log_timezone = 'UTC'
datestyle = 'iso, mdy'
timezone = 'UTC'
lc_messages = 'en_US.utf8'
lc_monetary = 'en_US.utf8'
lc_numeric = 'en_US.utf8'
lc_time = 'en_US.utf8'
default_text_search_config = 'pg_catalog.english'
EOF
    echo "postgres.conf created."
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating default .env file..."
    cat > .env << 'EOF'
# Database configuration
DB_USER=postgres
DB_PASS=postgres
DB_NAME=docconstruct
DB_PORT=5432

# Frontend configuration
NEXT_PUBLIC_URL=https://localhost
NEXT_PUBLIC_API_URL=http://localhost/api

# Application path for data storage
APP_PATH=/app/data
EOF
    echo ".env file created."
fi

echo "Setup complete. You can now run docker-compose up to start the application." 