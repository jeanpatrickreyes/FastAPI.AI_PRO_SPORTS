# 05 - COMPLETE SETUP GUIDE

## AI PRO SPORTS - Full Installation & Configuration

---

## Table of Contents

1. System Requirements
2. Development Environment Setup
3. Production Environment Setup
4. Database Configuration
5. Redis Configuration
6. External API Setup
7. ML Environment Setup
8. Security Configuration
9. Monitoring Setup
10. Verification & Testing

---

## 1. System Requirements

### Minimum Requirements (Development)

| Component | Requirement |
|-----------|-------------|
| CPU | 4 cores |
| RAM | 16 GB |
| Storage | 100 GB SSD |
| OS | Ubuntu 22.04+ / macOS 12+ |
| Docker | 24.0+ |
| Docker Compose | 2.20+ |
| Python | 3.11+ |

### Recommended Requirements (Production)

| Component | Requirement |
|-----------|-------------|
| CPU | 24 cores (Intel Xeon) |
| RAM | 512 GB DDR4 |
| GPU | NVIDIA RTX PRO 6000 (48GB+) |
| Storage | 2 TB NVMe SSD |
| OS | Ubuntu 24.04 LTS |
| Network | 1 Gbps unmetered |

### Software Dependencies

```bash
# Core dependencies
python >= 3.11
postgresql >= 15
redis >= 7.0
docker >= 24.0
docker-compose >= 2.20
nginx >= 1.24
```

---

## 2. Development Environment Setup

### 2.1 Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3.11-dev -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y
```

### 2.2 Clone Repository

```bash
git clone https://github.com/your-org/ai-pro-sports.git
cd ai-pro-sports
```

### 2.3 Create Virtual Environment

```bash
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 2.4 Configure Environment Variables

```bash
cp .env.example .env
```

**Edit .env with required values:**

```env
# Application
APP_NAME=AI PRO SPORTS
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=dev-secret-key-change-in-production-min-32-chars

# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ai_pro_sports
DATABASE_POOL_SIZE=10

# Redis
REDIS_URL=redis://localhost:6379/0

# External APIs
ODDS_API_KEY=your-odds-api-key
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4

# ML Configuration
H2O_MAX_MEM_SIZE=8g
AUTOGLUON_PRESET=medium_quality

# Betting
KELLY_FRACTION=0.25
MAX_BET_PERCENT=0.02
```

### 2.5 Start Development Services

```bash
# Start database and Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Initialize database
python -m app.cli.admin db init
python -m app.cli.admin db seed

# Start API in development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 3. Production Environment Setup

### 3.1 Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
    curl wget git vim htop \
    build-essential libpq-dev \
    nginx certbot python3-certbot-nginx

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3.2 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 3.3 Install NVIDIA Drivers (GPU Server)

```bash
# Add NVIDIA repository
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
    sudo tee /etc/apt/sources.list.d/nvidia-docker.list

# Install drivers
sudo apt update
sudo apt install -y nvidia-driver-535 nvidia-docker2

# Restart Docker
sudo systemctl restart docker

# Verify GPU
nvidia-smi
```

### 3.4 Deploy Application

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/your-org/ai-pro-sports.git
sudo chown -R $USER:$USER ai-pro-sports
cd ai-pro-sports

# Configure production environment
cp .env.example .env
nano .env  # Edit with production values

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

---

## 4. Database Configuration

### 4.1 PostgreSQL Setup

```bash
# Create database
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE ai_pro_sports;"

# Create user
docker-compose exec postgres psql -U postgres -c \
    "CREATE USER ai_pro_sports WITH PASSWORD 'secure-password';"

# Grant privileges
docker-compose exec postgres psql -U postgres -c \
    "GRANT ALL PRIVILEGES ON DATABASE ai_pro_sports TO ai_pro_sports;"
```

### 4.2 Database Initialization

```bash
# Run migrations
docker-compose exec api python -m app.cli.admin db init

# Verify tables created
docker-compose exec postgres psql -U postgres -d ai_pro_sports -c "\dt"
```

### 4.3 Database Tables (43 Total)

| Category | Tables |
|----------|--------|
| Users & Auth | users, sessions, api_keys, user_preferences, audit_logs |
| Sports Data | sports, teams, players, games, game_features, team_stats, player_game_stats, seasons |
| Odds | odds, odds_movements, closing_lines, line_snapshots |
| Predictions | predictions, player_props, prediction_explanations, prediction_grades |
| ML Models | ml_models, model_performance, training_runs, feature_importance, calibration_data |
| Betting | bankrolls, bankroll_transactions, bets, bet_outcomes |
| System | system_logs, scheduled_tasks, alerts, data_quality_checks, backtest_runs, system_health |

### 4.4 Backup Configuration

```bash
# Create backup script
cat > /opt/ai-pro-sports/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/opt/backups/ai-pro-sports
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres ai_pro_sports | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
find $BACKUP_DIR -mtime +7 -delete
EOF

chmod +x /opt/ai-pro-sports/scripts/backup.sh

# Add to crontab (daily at 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/ai-pro-sports/scripts/backup.sh") | crontab -
```

---

## 5. Redis Configuration

### 5.1 Redis Setup

```bash
# Redis configuration in docker-compose
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --maxmemory 2gb --maxmemory-policy allkeys-lru
  volumes:
    - redis_data:/data
  ports:
    - "6379:6379"
```

### 5.2 Cache Configuration

| Cache Key Pattern | TTL | Purpose |
|-------------------|-----|---------|
| `odds:*` | 30 seconds | Live odds data |
| `predictions:*` | 300 seconds | Generated predictions |
| `games:*` | 3600 seconds | Game information |
| `models:*` | 86400 seconds | ML model metadata |
| `features:*` | 1800 seconds | Computed features |

### 5.3 Verify Redis Connection

```bash
docker-compose exec redis redis-cli ping
# Expected: PONG

docker-compose exec redis redis-cli info memory
```

---

## 6. External API Setup

### 6.1 TheOddsAPI Configuration

1. Register at https://the-odds-api.com
2. Get API key from dashboard
3. Add to .env:

```env
ODDS_API_KEY=your-api-key-here
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4
```

**Rate Limits by Plan:**

| Plan | Requests/Month | Recommended Use |
|------|----------------|-----------------|
| Free | 500 | Development only |
| Starter | 10,000 | Small scale testing |
| Pro | 50,000 | Production (single sport) |
| Ultra | 200,000+ | Full production |

### 6.2 ESPN API Configuration

```env
ESPN_API_BASE_URL=https://site.api.espn.com/apis/site/v2
```

No API key required for public endpoints.

### 6.3 Weather API Configuration

```env
WEATHER_API_KEY=your-openweathermap-key
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5
```

---

## 7. ML Environment Setup

### 7.1 H2O Configuration

```env
H2O_MAX_MEM_SIZE=32g
H2O_MAX_MODELS=50
H2O_MAX_RUNTIME_SECS=3600
H2O_NTHREADS=-1
```

### 7.2 AutoGluon Configuration

```env
AUTOGLUON_PRESET=best_quality
AUTOGLUON_TIME_LIMIT=3600
AUTOGLUON_USE_GPU=true
```

### 7.3 GPU Verification

```bash
# Verify GPU is available to Docker
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi

# Test PyTorch GPU
docker-compose exec api python -c "import torch; print(torch.cuda.is_available())"
```

### 7.4 Model Storage

```bash
# Create model directories
mkdir -p /opt/ai-pro-sports/models/{h2o,autogluon,sklearn}

# Set permissions
chmod -R 755 /opt/ai-pro-sports/models
```

---

## 8. Security Configuration

### 8.1 Generate Secure Keys

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Generate JWT_SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 8.2 SSL Certificate Setup

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 8.3 Security Environment Variables

```env
# Security
SECRET_KEY=your-64-char-secret-key
JWT_SECRET_KEY=your-64-char-jwt-secret
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
BCRYPT_ROUNDS=12

# 2FA
TOTP_ISSUER=AI PRO SPORTS
TOTP_DIGITS=6
TOTP_INTERVAL=30
```

---

## 9. Monitoring Setup

### 9.1 Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['api:8000']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### 9.2 Grafana Setup

```bash
# Access Grafana
http://localhost:3000

# Default credentials
Username: admin
Password: admin (change on first login)

# Import dashboards
Dashboard IDs: 1860 (Node Exporter), 763 (Redis), 9628 (PostgreSQL)
```

### 9.3 Alert Configuration

```env
# Telegram Alerts
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Slack Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# Email Alerts
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_EMAIL_RECIPIENTS=admin@yourdomain.com
```

---

## 10. Verification & Testing

### 10.1 System Health Check

```bash
# Check all services
docker-compose ps

# API health
curl http://localhost:8000/api/v1/health

# Detailed health
curl http://localhost:8000/api/v1/health/detailed
```

### 10.2 Run Test Suite

```bash
# All tests
docker-compose exec api pytest

# With coverage
docker-compose exec api pytest --cov=app --cov-report=html

# Specific tests
docker-compose exec api pytest tests/unit/ -v
docker-compose exec api pytest tests/integration/ -v
```

### 10.3 Verification Checklist

| Check | Command | Expected |
|-------|---------|----------|
| API Running | `curl localhost:8000/health` | `{"status": "healthy"}` |
| Database Connected | `docker-compose exec api python -c "from app.core.database import engine; print('OK')"` | OK |
| Redis Connected | `docker-compose exec redis redis-cli ping` | PONG |
| Tables Created | `docker-compose exec postgres psql -U postgres -d ai_pro_sports -c "\dt" \| wc -l` | 43+ |
| GPU Available | `docker-compose exec api python -c "import torch; print(torch.cuda.is_available())"` | True |

### 10.4 First Data Collection

```bash
# Collect odds for NBA
docker-compose exec api python -m app.cli.admin data collect-odds -s NBA

# Verify data
curl http://localhost:8000/api/v1/games?sport=NBA
```

---

## Setup Complete

Your AI PRO SPORTS system is now fully configured. Next steps:

1. **Train Models:** See `09_ML_PIPELINE_GUIDE.md`
2. **Generate Predictions:** See `27_PREDICTION_REASONING_GUIDE.md`
3. **Monitor System:** See `31_GRAFANA_DASHBOARD_BUILDER.md`
4. **Deploy Production:** See `06_DEPLOYMENT_CHECKLIST.md`

---

**Setup Version:** 2.0  
**Last Updated:** January 2026
