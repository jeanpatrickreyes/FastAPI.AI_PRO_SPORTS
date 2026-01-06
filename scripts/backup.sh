#!/bin/bash
# ============================================================================
# AI PRO SPORTS - Backup Script
# ============================================================================
# Version: 2.1.0
#
# Usage: ./scripts/backup.sh [OPTIONS]
#
# Options:
#   --db-only       Backup database only
#   --models-only   Backup models only
#   --full          Full backup (default)
#   --encrypt       Encrypt backup with GPG
#   --upload        Upload to remote storage
# ============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Options
BACKUP_DB=true
BACKUP_MODELS=true
BACKUP_CONFIG=true
ENCRYPT=false
UPLOAD=false

# Load environment
if [[ -f "$PROJECT_DIR/.env" ]]; then
    source "$PROJECT_DIR/.env"
fi

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --db-only)
            BACKUP_DB=true
            BACKUP_MODELS=false
            BACKUP_CONFIG=false
            shift
            ;;
        --models-only)
            BACKUP_DB=false
            BACKUP_MODELS=true
            BACKUP_CONFIG=false
            shift
            ;;
        --full)
            BACKUP_DB=true
            BACKUP_MODELS=true
            BACKUP_CONFIG=true
            shift
            ;;
        --encrypt)
            ENCRYPT=true
            shift
            ;;
        --upload)
            UPLOAD=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Create backup directory
mkdir -p "$BACKUP_DIR"
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
mkdir -p "$BACKUP_PATH"

log_info "Starting backup at $TIMESTAMP"

# Backup database
if [[ "$BACKUP_DB" == true ]]; then
    log_info "Backing up database..."
    
    if docker compose -f "$PROJECT_DIR/docker-compose.yml" ps postgres 2>/dev/null | grep -q "running"; then
        docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T postgres \
            pg_dump -U "${POSTGRES_USER:-ai_pro_sports}" "${POSTGRES_DB:-ai_pro_sports}" \
            > "$BACKUP_PATH/database.sql"
        
        # Compress
        gzip "$BACKUP_PATH/database.sql"
        log_success "Database backup created: database.sql.gz"
    else
        log_warning "PostgreSQL container not running. Skipping database backup."
    fi
fi

# Backup models
if [[ "$BACKUP_MODELS" == true ]]; then
    log_info "Backing up models..."
    
    if [[ -d "$PROJECT_DIR/models" ]]; then
        cp -r "$PROJECT_DIR/models" "$BACKUP_PATH/"
        log_success "Models backup created."
    else
        log_warning "Models directory not found. Skipping."
    fi
fi

# Backup configuration
if [[ "$BACKUP_CONFIG" == true ]]; then
    log_info "Backing up configuration..."
    
    mkdir -p "$BACKUP_PATH/config"
    
    # Copy .env (sensitive - handle carefully)
    if [[ -f "$PROJECT_DIR/.env" ]]; then
        cp "$PROJECT_DIR/.env" "$BACKUP_PATH/config/.env.backup"
    fi
    
    # Copy other config files
    if [[ -d "$PROJECT_DIR/config" ]]; then
        cp -r "$PROJECT_DIR/config" "$BACKUP_PATH/"
    fi
    
    log_success "Configuration backup created."
fi

# Create archive
log_info "Creating backup archive..."
cd "$BACKUP_DIR"
tar -czf "backup_$TIMESTAMP.tar.gz" "backup_$TIMESTAMP"
rm -rf "$BACKUP_PATH"

FINAL_BACKUP="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
log_success "Backup archive created: $FINAL_BACKUP"

# Encrypt if requested
if [[ "$ENCRYPT" == true ]]; then
    log_info "Encrypting backup..."
    
    if command -v gpg &> /dev/null; then
        gpg --symmetric --cipher-algo AES256 "$FINAL_BACKUP"
        rm "$FINAL_BACKUP"
        FINAL_BACKUP="$FINAL_BACKUP.gpg"
        log_success "Backup encrypted: $FINAL_BACKUP"
    else
        log_warning "GPG not installed. Skipping encryption."
    fi
fi

# Upload if requested
if [[ "$UPLOAD" == true ]]; then
    log_info "Uploading backup..."
    
    # Example: Upload to S3
    if command -v aws &> /dev/null && [[ -n "$S3_BACKUP_BUCKET" ]]; then
        aws s3 cp "$FINAL_BACKUP" "s3://$S3_BACKUP_BUCKET/ai-pro-sports/"
        log_success "Backup uploaded to S3."
    else
        log_warning "AWS CLI not configured. Skipping upload."
    fi
fi

# Clean old backups
log_info "Cleaning old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "backup_*.tar.gz*" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# Summary
BACKUP_SIZE=$(du -h "$FINAL_BACKUP" | cut -f1)
log_success "Backup complete!"
echo ""
echo "  File: $FINAL_BACKUP"
echo "  Size: $BACKUP_SIZE"
echo ""
