# AI PRO SPORTS - Quick Start Guide

## Starting the Project After PC Restart

### Prerequisites
- Docker and Docker Compose must be installed
- Navigate to the project directory

### Quick Start (All Services)

```bash
# Navigate to project directory
cd "/home/Music/AI PRO SPORTS FINAL PROJECT BIBLE/AI_PRO_SPORTS_FINAL_PROJECT_BIBLE"

# Start all services in detached mode
docker compose up -d

# Check status of all services
docker compose ps

# View logs (optional)
docker compose logs -f
```

### Starting Individual Services

If you only need specific services:

```bash
# Start only backend services (API, Database, Redis)
docker compose up -d postgres redis api

# Start frontend
docker compose up -d frontend

# Start all services
docker compose up -d
```

### Verifying Services Are Running

```bash
# Check container status
docker compose ps

# Test API (should return JSON)
curl http://localhost:8000/

# Test Frontend (should return HTML)
curl http://localhost:3000/

# Test Nginx (should return HTML)
curl http://localhost:80/
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Frontend (via Nginx)**: http://localhost:80
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (if debug mode enabled)
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v
```

### Troubleshooting

#### If services fail to start:

```bash
# Check logs for errors
docker compose logs api
docker compose logs frontend
docker compose logs postgres

# Rebuild containers if needed
docker compose build

# Restart specific service
docker compose restart api
docker compose restart frontend
```

#### If port conflicts occur:

```bash
# Check what's using the ports
sudo lsof -i :8000  # Backend
sudo lsof -i :3000  # Frontend
sudo lsof -i :80    # Nginx
```

### Environment Variables

The project uses environment variables from `docker-compose.yml`. Key variables:
- `VITE_API_URL`: Frontend API URL (set to `http://localhost:8000/api/v1`)
- `SECRET_KEY`: Backend secret key (must be 32+ chars in production)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

### Demo Login

Use the "Continue with Demo Account" button on the login page to access the dashboard without real authentication.

