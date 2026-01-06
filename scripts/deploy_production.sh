#!/bin/bash
# ============================================================================
# AI PRO SPORTS - Production Deployment Script
# ============================================================================
# Version: 2.1.0
# Last Updated: January 2026
#
# Usage: ./scripts/deploy.sh [OPTIONS]
#
# Options:
#   --full          Full deployment (default)
#   --update        Update existing deployment
#   --backup        Backup before deployment
#   --no-gpu        Deploy without GPU support
#   --help          Show this help message
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Default options
FULL_DEPLOY=true
UPDATE_ONLY=false
BACKUP_FIRST=true
GPU_ENABLED=true

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --full)
            FULL_DEPLOY=true
            UPDATE_ONLY=false
            shift
            ;;
        --update)
            UPDATE_ONLY=true
            FULL_DEPLOY=false
            shift
            ;;
        --backup)
            BACKUP_FIRST=true
            shift
            ;;
        --no-gpu)
            GPU_ENABLED=false
            shift
            ;;
        --help)
            echo "AI PRO SPORTS - Production Deployment Script"
            echo ""
            echo "Usage: ./scripts/deploy.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --full          Full deployment (default)"
            echo "  --update        Update existing deployment"
            echo "  --backup        Backup before deployment"
            echo "  --no-gpu        Deploy without GPU support"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# ============================================================================
# Pre-flight Checks
# ============================================================================
preflight_checks() {
    log_info "Running pre-flight checks..."
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. Consider using a non-root user."
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check .env file
    if [[ ! -f "$PROJECT_DIR/.env" ]]; then
        log_error ".env file not found. Please copy .env.production.example to .env and configure it."
        exit 1
    fi
    
    # Check required environment variables
    source "$PROJECT_DIR/.env"
    
    if [[ "$SECRET_KEY" == "CHANGE_ME"* ]]; then
        log_error "SECRET_KEY is not configured. Please update .env file."
        exit 1
    fi
    
    if [[ "$JWT_SECRET_KEY" == "CHANGE_ME"* ]]; then
        log_error "JWT_SECRET_KEY is not configured. Please update .env file."
        exit 1
    fi
    
    if [[ "$ODDS_API_KEY" == "CHANGE_ME"* ]]; then
        log_error "ODDS_API_KEY is not configured. Please update .env file."
        exit 1
    fi
    
    # Check GPU if enabled
    if [[ "$GPU_ENABLED" == true ]]; then
        if ! nvidia-smi &> /dev/null; then
            log_warning "NVIDIA GPU not detected. Disabling GPU support."
            GPU_ENABLED=false
        else
            log_success "NVIDIA GPU detected."
        fi
    fi
    
    log_success "Pre-flight checks passed."
}

# ============================================================================
# Backup Function
# ============================================================================
create_backup() {
    log_info "Creating backup..."
    
    BACKUP_DIR="$PROJECT_DIR/backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_NAME="backup_$TIMESTAMP"
    
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    
    # Backup database
    if docker compose ps postgres 2>/dev/null | grep -q "running"; then
        log_info "Backing up database..."
        docker compose exec -T postgres pg_dump -U ai_pro_sports ai_pro_sports > "$BACKUP_DIR/$BACKUP_NAME/database.sql"
        log_success "Database backup created."
    fi
    
    # Backup models
    if [[ -d "$PROJECT_DIR/models" ]]; then
        log_info "Backing up models..."
        cp -r "$PROJECT_DIR/models" "$BACKUP_DIR/$BACKUP_NAME/"
        log_success "Models backup created."
    fi
    
    # Backup .env
    cp "$PROJECT_DIR/.env" "$BACKUP_DIR/$BACKUP_NAME/.env.backup"
    
    # Create compressed archive
    cd "$BACKUP_DIR"
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    
    log_success "Backup created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
}

# ============================================================================
# System Updates
# ============================================================================
update_system() {
    log_info "Updating system packages..."
    
    if command -v apt &> /dev/null; then
        sudo apt update
        sudo apt upgrade -y
        sudo apt autoremove -y
    elif command -v yum &> /dev/null; then
        sudo yum update -y
    fi
    
    log_success "System packages updated."
}

# ============================================================================
# Docker Deployment
# ============================================================================
deploy_docker() {
    log_info "Deploying Docker containers..."
    
    cd "$PROJECT_DIR"
    
    # Stop existing containers
    if [[ "$UPDATE_ONLY" == true ]]; then
        log_info "Stopping existing containers..."
        docker compose down
    fi
    
    # Pull latest images
    log_info "Pulling latest images..."
    docker compose pull
    
    # Build custom images
    log_info "Building application images..."
    docker compose build --no-cache
    
    # Start containers
    log_info "Starting containers..."
    if [[ "$GPU_ENABLED" == true ]]; then
        docker compose up -d
    else
        docker compose up -d --scale worker=1
    fi
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check container health
    check_container_health
    
    log_success "Docker deployment complete."
}

# ============================================================================
# Container Health Check
# ============================================================================
check_container_health() {
    log_info "Checking container health..."
    
    local services=("api" "postgres" "redis" "nginx")
    local all_healthy=true
    
    for service in "${services[@]}"; do
        if docker compose ps "$service" 2>/dev/null | grep -q "running\|healthy"; then
            log_success "$service is running."
        else
            log_error "$service is not running properly."
            all_healthy=false
        fi
    done
    
    if [[ "$all_healthy" == false ]]; then
        log_error "Some services are not healthy. Check logs with: docker compose logs"
        exit 1
    fi
}

# ============================================================================
# Database Initialization
# ============================================================================
initialize_database() {
    log_info "Initializing database..."
    
    # Wait for PostgreSQL to be ready
    log_info "Waiting for PostgreSQL..."
    sleep 10
    
    # Run migrations
    log_info "Running database migrations..."
    docker compose exec -T api python -m app.cli.admin db migrate
    
    # Seed initial data (only on full deploy)
    if [[ "$FULL_DEPLOY" == true ]]; then
        log_info "Seeding initial data..."
        docker compose exec -T api python -m app.cli.admin db seed || true
    fi
    
    log_success "Database initialization complete."
}

# ============================================================================
# SSL Configuration
# ============================================================================
configure_ssl() {
    log_info "Configuring SSL..."
    
    source "$PROJECT_DIR/.env"
    
    # Check if SSL certificates exist
    if [[ -f "/etc/letsencrypt/live/${DOMAIN:-localhost}/fullchain.pem" ]]; then
        log_success "SSL certificates found."
    else
        log_warning "SSL certificates not found. Please configure SSL manually."
        log_info "Run: sudo certbot certonly --standalone -d yourdomain.com"
    fi
}

# ============================================================================
# Verification
# ============================================================================
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Health check
    log_info "Checking API health..."
    local health_response
    health_response=$(curl -s http://localhost:8000/api/v1/health || echo "failed")
    
    if [[ "$health_response" == *"healthy"* ]]; then
        log_success "API health check passed."
    else
        log_warning "API health check returned unexpected response."
    fi
    
    # Check database connection
    log_info "Checking database connection..."
    if docker compose exec -T api python -c "from app.core.database import db_manager; import asyncio; asyncio.run(db_manager.health_check())" 2>/dev/null; then
        log_success "Database connection verified."
    else
        log_warning "Database connection check failed."
    fi
    
    # Check Redis connection
    log_info "Checking Redis connection..."
    if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "Redis connection verified."
    else
        log_warning "Redis connection check failed."
    fi
    
    log_success "Deployment verification complete."
}

# ============================================================================
# Post-Deployment Tasks
# ============================================================================
post_deployment() {
    log_info "Running post-deployment tasks..."
    
    # Clear cache
    log_info "Clearing cache..."
    docker compose exec -T api python -m app.cli.admin system cache-clear || true
    
    # Restart scheduler to pick up new jobs
    log_info "Restarting scheduler..."
    docker compose restart worker || true
    
    log_success "Post-deployment tasks complete."
}

# ============================================================================
# Display Summary
# ============================================================================
display_summary() {
    echo ""
    echo "============================================================================"
    echo "                    AI PRO SPORTS - Deployment Complete"
    echo "============================================================================"
    echo ""
    echo "Services Status:"
    docker compose ps
    echo ""
    echo "Access Points:"
    echo "  - API:        http://localhost:8000"
    echo "  - API Docs:   http://localhost:8000/docs"
    echo "  - Health:     http://localhost:8000/api/v1/health"
    echo "  - Prometheus: http://localhost:9090"
    echo "  - Grafana:    http://localhost:3000"
    echo ""
    echo "Useful Commands:"
    echo "  - View logs:        docker compose logs -f"
    echo "  - API logs:         docker compose logs -f api"
    echo "  - Restart:          docker compose restart"
    echo "  - Stop:             docker compose down"
    echo "  - Database shell:   docker compose exec postgres psql -U ai_pro_sports"
    echo ""
    echo "Next Steps:"
    echo "  1. Load historical data:  docker compose exec api python -m app.cli.admin data backfill"
    echo "  2. Train models:          docker compose exec api python -m app.cli.admin model train -s NBA"
    echo "  3. Configure alerts:      Update Telegram/Slack settings in .env"
    echo ""
    log_success "Deployment completed successfully!"
}

# ============================================================================
# Main Execution
# ============================================================================
main() {
    echo ""
    echo "============================================================================"
    echo "                    AI PRO SPORTS - Production Deployment"
    echo "                           Version 2.1.0"
    echo "============================================================================"
    echo ""
    
    cd "$PROJECT_DIR"
    
    # Run pre-flight checks
    preflight_checks
    
    # Create backup if requested
    if [[ "$BACKUP_FIRST" == true ]] && [[ "$UPDATE_ONLY" == true ]]; then
        create_backup
    fi
    
    # Full deployment
    if [[ "$FULL_DEPLOY" == true ]]; then
        update_system
    fi
    
    # Deploy Docker
    deploy_docker
    
    # Initialize database
    initialize_database
    
    # Configure SSL
    configure_ssl
    
    # Verify deployment
    verify_deployment
    
    # Post-deployment tasks
    post_deployment
    
    # Display summary
    display_summary
}

# Run main function
main "$@"
