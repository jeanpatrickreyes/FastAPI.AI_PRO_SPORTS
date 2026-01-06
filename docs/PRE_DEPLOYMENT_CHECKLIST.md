# AI PRO SPORTS - Pre-Deployment Checklist

## Version 2.1 | January 2026

This checklist ensures your AI PRO SPORTS system is 100% ready for production deployment.

---

## 1. SERVER PROVISIONING

### 1.1 Hetzner GEX131 Setup
- [ ] Order Hetzner GEX131 dedicated server
  - GPU: NVIDIA RTX PRO 6000 (96GB VRAM)
  - CPU: 24-core Intel Xeon
  - RAM: 512GB DDR4
  - Storage: 2TB NVMe SSD
  - Network: 1 Gbps unmetered
- [ ] Select datacenter location (EU or US based on target audience)
- [ ] Configure server hostname
- [ ] Note server IP address: ________________

### 1.2 Operating System
- [ ] Install Ubuntu 22.04 LTS
- [ ] Update system packages:
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```
- [ ] Install essential packages:
  ```bash
  sudo apt install -y curl wget git vim htop net-tools
  ```

### 1.3 Security Hardening
- [ ] Configure SSH key authentication
- [ ] Disable password authentication:
  ```bash
  sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
  sudo systemctl restart sshd
  ```
- [ ] Configure UFW firewall:
  ```bash
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow ssh
  sudo ufw allow http
  sudo ufw allow https
  sudo ufw enable
  ```
- [ ] Set up fail2ban:
  ```bash
  sudo apt install fail2ban -y
  sudo systemctl enable fail2ban
  ```

---

## 2. SOFTWARE INSTALLATION

### 2.1 Docker Installation
- [ ] Install Docker:
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  ```
- [ ] Install Docker Compose:
  ```bash
  sudo apt install docker-compose-plugin -y
  ```
- [ ] Verify installation:
  ```bash
  docker --version
  docker compose version
  ```

### 2.2 NVIDIA Drivers & CUDA
- [ ] Install NVIDIA drivers:
  ```bash
  sudo apt install nvidia-driver-535 -y
  ```
- [ ] Install NVIDIA Container Toolkit:
  ```bash
  distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
  curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
  curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
  sudo apt update
  sudo apt install -y nvidia-container-toolkit
  sudo systemctl restart docker
  ```
- [ ] Verify GPU access:
  ```bash
  nvidia-smi
  docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi
  ```

### 2.3 SSL Certificates
- [ ] Install Certbot:
  ```bash
  sudo apt install certbot -y
  ```
- [ ] Obtain SSL certificate:
  ```bash
  sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
  ```
- [ ] Note certificate paths:
  - Certificate: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
  - Private Key: /etc/letsencrypt/live/yourdomain.com/privkey.pem
- [ ] Configure auto-renewal:
  ```bash
  sudo certbot renew --dry-run
  ```

---

## 3. APPLICATION DEPLOYMENT

### 3.1 Clone Repository
- [ ] Create application directory:
  ```bash
  sudo mkdir -p /opt/ai-pro-sports
  sudo chown $USER:$USER /opt/ai-pro-sports
  cd /opt/ai-pro-sports
  ```
- [ ] Upload or clone project files
- [ ] Set permissions:
  ```bash
  chmod +x scripts/*.sh
  ```

### 3.2 Environment Configuration
- [ ] Copy environment template:
  ```bash
  cp .env.example .env
  ```
- [ ] Generate secure keys:
  ```bash
  # Generate SECRET_KEY
  openssl rand -hex 64
  
  # Generate JWT_SECRET_KEY
  openssl rand -hex 64
  
  # Generate AES_KEY
  openssl rand -hex 32
  ```
- [ ] Update .env file with all required values (see Section 4)

### 3.3 Docker Deployment
- [ ] Build and start containers:
  ```bash
  docker compose up -d --build
  ```
- [ ] Verify all services are running:
  ```bash
  docker compose ps
  ```
- [ ] Check logs for errors:
  ```bash
  docker compose logs -f
  ```

---

## 4. CONFIGURATION VALUES

### 4.1 Required API Keys
- [ ] TheOddsAPI Key: ________________
  - Obtain from: https://the-odds-api.com
  - Plan: Premium recommended ($99/month for 50,000 requests)

### 4.2 Security Keys (Generate Unique Values!)
- [ ] SECRET_KEY (64+ chars): ________________
- [ ] JWT_SECRET_KEY (64+ chars): ________________
- [ ] AES_KEY (32+ chars): ________________

### 4.3 Database Credentials
- [ ] POSTGRES_USER: ________________
- [ ] POSTGRES_PASSWORD: ________________
- [ ] POSTGRES_DB: ai_pro_sports

### 4.4 Alerting Configuration

#### Telegram (Optional but Recommended)
- [ ] Create Telegram bot via @BotFather
- [ ] TELEGRAM_BOT_TOKEN: ________________
- [ ] TELEGRAM_CHAT_ID: ________________

#### Slack (Optional)
- [ ] Create Slack webhook URL
- [ ] SLACK_WEBHOOK_URL: ________________

#### Email Alerts (Optional)
- [ ] SMTP_HOST: ________________
- [ ] SMTP_PORT: ________________
- [ ] SMTP_USER: ________________
- [ ] SMTP_PASSWORD: ________________
- [ ] ALERT_EMAIL: ________________

---

## 5. DATABASE INITIALIZATION

### 5.1 Run Migrations
- [ ] Initialize database schema:
  ```bash
  docker compose exec api python -m app.cli.admin db init
  ```
- [ ] Run migrations:
  ```bash
  docker compose exec api python -m app.cli.admin db migrate
  ```

### 5.2 Seed Initial Data
- [ ] Seed sport configurations:
  ```bash
  docker compose exec api python -m app.cli.admin db seed
  ```
- [ ] Create admin user:
  ```bash
  docker compose exec api python -m app.cli.admin user create-admin
  ```
- [ ] Note admin credentials: ________________

### 5.3 Configure Automated Backups
- [ ] Create backup script:
  ```bash
  mkdir -p /opt/ai-pro-sports/backups
  chmod +x scripts/backup.sh
  ```
- [ ] Add cron job for daily backups:
  ```bash
  crontab -e
  # Add: 0 3 * * * /opt/ai-pro-sports/scripts/backup.sh
  ```

---

## 6. HISTORICAL DATA LOADING

### 6.1 Data Requirements
| Sport | Years Required | Seasons |
|-------|---------------|---------|
| NFL | 8-10 years | 2014-2023 |
| NCAAF | 8-10 years | 2014-2023 |
| CFL | 5 years | 2019-2023 |
| NBA | 8-10 years | 2014-2024 |
| NCAAB | 8-10 years | 2014-2024 |
| WNBA | 5 years | 2019-2024 |
| NHL | 8-10 years | 2014-2024 |
| MLB | 8-10 years | 2014-2024 |
| ATP | 5-8 years | 2017-2024 |
| WTA | 5-8 years | 2017-2024 |

**Note**: Exclude COVID-affected seasons 2020-2021 where appropriate.

### 6.2 Load Historical Data
- [ ] Load historical games and odds:
  ```bash
  docker compose exec api python -m app.cli.admin data backfill --sport NFL --years 10
  # Repeat for each sport
  ```
- [ ] Verify data quality:
  ```bash
  docker compose exec api python -m app.cli.admin data verify
  ```

---

## 7. MODEL TRAINING

### 7.1 Train Initial Models
- [ ] Train models for each sport:
  ```bash
  # NFL
  docker compose exec api python -m app.cli.admin model train -s NFL -b spread
  docker compose exec api python -m app.cli.admin model train -s NFL -b moneyline
  docker compose exec api python -m app.cli.admin model train -s NFL -b total
  
  # Repeat for all 10 sports
  ```

### 7.2 Validate Model Performance
- [ ] Check model AUC scores (target: >0.65 for Tier A)
- [ ] Run walk-forward validation
- [ ] Run backtests:
  ```bash
  docker compose exec api python -m app.cli.admin backtest run --sport NFL --days 365
  ```

### 7.3 Promote Models to Production
- [ ] Review model performance metrics
- [ ] Promote best models:
  ```bash
  docker compose exec api python -m app.cli.admin model promote MODEL_ID
  ```

---

## 8. MONITORING SETUP

### 8.1 Prometheus Configuration
- [ ] Verify Prometheus is scraping metrics:
  - Access: http://your-server:9090
- [ ] Confirm targets are up

### 8.2 Grafana Dashboards
- [ ] Access Grafana: http://your-server:3000
- [ ] Default credentials: admin/admin (change immediately!)
- [ ] Import AI Pro Sports dashboards from /grafana/dashboards/
- [ ] Configure alert rules

### 8.3 Log Aggregation
- [ ] Configure log rotation:
  ```bash
  sudo nano /etc/logrotate.d/ai-pro-sports
  ```
- [ ] Set up centralized logging (optional):
  - Consider Datadog, Loggly, or ELK stack

---

## 9. VERIFICATION TESTS

### 9.1 Health Checks
- [ ] Basic health check:
  ```bash
  curl http://localhost:8000/api/v1/health
  ```
- [ ] Detailed health check:
  ```bash
  curl http://localhost:8000/api/v1/health/detailed
  ```
- [ ] All components should show "healthy"

### 9.2 API Functionality
- [ ] Test authentication:
  ```bash
  curl -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "your-password"}'
  ```
- [ ] Test predictions endpoint
- [ ] Test odds collection
- [ ] Test bet tracking

### 9.3 Automated Test Suite
- [ ] Run all tests:
  ```bash
  docker compose exec api pytest
  ```
- [ ] All 403 tests should pass

### 9.4 End-to-End Workflow
- [ ] Generate predictions for upcoming games
- [ ] Verify SHAP explanations are generated
- [ ] Verify SHA-256 hashes are created
- [ ] Test auto-grading on completed games
- [ ] Verify CLV tracking

---

## 10. GO-LIVE CHECKLIST

### 10.1 Final Security Review
- [ ] All default passwords changed
- [ ] SSL certificate active and valid
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] API keys secured

### 10.2 Performance Verification
- [ ] API response times <200ms (p95)
- [ ] Database queries optimized
- [ ] Cache hit rate >80%
- [ ] GPU utilization normal during training

### 10.3 Alerting Verification
- [ ] Test Telegram alerts
- [ ] Test Slack alerts (if configured)
- [ ] Test email alerts (if configured)
- [ ] Verify PagerDuty integration (if configured)

### 10.4 Backup Verification
- [ ] Test backup creation
- [ ] Test backup restoration
- [ ] Verify backup retention policy

### 10.5 Documentation
- [ ] Admin credentials documented securely
- [ ] API keys documented securely
- [ ] Runbook for common operations created
- [ ] Incident response plan documented

---

## 11. POST-DEPLOYMENT

### 11.1 Monitoring Schedule
- Daily: Review prediction accuracy
- Daily: Check CLV performance
- Weekly: Review model performance
- Monthly: Retrain models with new data

### 11.2 Maintenance Windows
- Schedule weekly maintenance window for updates
- Schedule monthly model retraining

### 11.3 Support Contacts
- Server Provider: Hetzner Support
- TheOddsAPI Support: support@the-odds-api.com
- Internal Contact: ________________

---

## SIGN-OFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| System Administrator | | | |
| Security Review | | | |
| Final Approval | | | |

---

**Deployment Status**: ☐ Ready for Production

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________
