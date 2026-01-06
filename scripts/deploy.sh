#!/bin/bash
# AI PRO SPORTS - Deployment Script
# Enterprise-Grade Sports Prediction Platform
# Version 2.0.0

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "========================================="
echo "AI PRO SPORTS - Deployment"
echo "========================================="

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
fi

# Navigate to project
cd "$PROJECT_DIR"

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env from example - please configure!"
fi

# Build and deploy
echo "Building containers..."
docker compose build

echo "Starting services..."
docker compose up -d

echo "Waiting for services..."
sleep 30

# Run migrations
echo "Running database migrations..."
docker compose exec -T api alembic upgrade head 2>/dev/null || echo "Migrations may need to be run manually"

echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo "API: http://localhost:8000"
echo "Grafana: http://localhost:3000"
echo "Prometheus: http://localhost:9090"
echo "========================================="
