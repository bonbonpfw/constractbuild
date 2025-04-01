#!/bin/bash

# Stop all containers
docker-compose down

# Remove all unused containers, networks, images and volumes
docker system prune -af --volumes

# Remove specific volumes if needed
docker volume rm $(docker volume ls -q)

# Clean up build cache
docker builder prune -af

# Remove any dangling images
docker rmi $(docker images -f "dangling=true" -q)

# Clean up local system
sudo apt-get clean
sudo apt-get autoremove -y 