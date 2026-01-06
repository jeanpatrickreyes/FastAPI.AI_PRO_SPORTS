# 06 - DEPLOYMENT CHECKLIST

## AI PRO SPORTS - Pre-Flight Deployment Verification

---

## Overview

This checklist must be completed before deploying AI PRO SPORTS to production. Each item must be verified and signed off.

---

## PHASE 1: INFRASTRUCTURE READINESS

### 1.1 Server Hardware

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | CPU: 24+ cores | ☐ | |
| [ ] | RAM: 512GB minimum | ☐ | |
| [ ] | Storage: 2TB NVMe SSD | ☐ | |
| [ ] | GPU: NVIDIA RTX PRO 6000 | ☐ | |
| [ ] | Network: 1Gbps unmetered | ☐ | |
| [ ] | Uptime SLA: 99.9%+ | ☐ | |

### 1.2 Operating System

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | Ubuntu 24.04 LTS installed | ☐ | |
| [ ] | System fully updated | ☐ | `apt update && apt upgrade` |
| [ ] | Timezone set to UTC | ☐ | `timedatectl set-timezone UTC` |
| [ ] | NTP synchronized | ☐ | `timedatectl status` |
| [ ] | Swap disabled (for Redis) | ☐ | `swapoff -a` |

### 1.3 Docker Environment

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | Docker 24.0+ installed | ☐ | `docker --version` |
| [ ] | Docker Compose 2.20+ installed | ☐ | `docker compose version` |
| [ ] | NVIDIA Container Toolkit installed | ☐ | `nvidia-docker --version` |
| [ ] | Docker daemon running | ☐ | `systemctl status docker` |
| [ ] | User added to docker group | ☐ | `groups $USER` |

---

## PHASE 2: SECURITY CONFIGURATION

### 2.1 Network Security

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | Firewall enabled (UFW) | ☐ | `ufw status` |
| [ ] | SSH on port 22 only | ☐ | |
| [ ] | HTTP (80) allowed | ☐ | For SSL redirect |
| [ ] | HTTPS (443) allowed | ☐ | |
| [ ] | All other ports blocked | ☐ | |
| [ ] | Fail2ban installed | ☐ | SSH protection |

### 2.2 SSL/TLS Configuration

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | SSL certificate obtained | ☐ | Let's Encrypt |
| [ ] | Certificate auto-renewal configured | ☐ | `certbot renew --dry-run` |
| [ ] | TLS 1.2+ enforced | ☐ | |
| [ ] | HTTPS redirect enabled | ☐ | |
| [ ] | HSTS enabled | ☐ | |

### 2.3 Application Security

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | SECRET_KEY: 64+ chars, unique | ☐ | |
| [ ] | JWT_SECRET_KEY: 64+ chars, unique | ☐ | |
| [ ] | DEBUG=false | ☐ | |
| [ ] | Database password: 32+ chars | ☐ | |
| [ ] | Redis password configured | ☐ | |
| [ ] | API rate limiting enabled | ☐ | 100 req/min |
| [ ] | CORS configured properly | ☐ | |

---

## PHASE 3: DATABASE READINESS

### 3.1 PostgreSQL Configuration

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | PostgreSQL 15+ running | ☐ | |
| [ ] | Database created | ☐ | `ai_pro_sports` |
| [ ] | User created with limited privileges | ☐ | |
| [ ] | Connection pooling configured | ☐ | Pool size: 20 |
| [ ] | All 43 tables created | ☐ | Run migrations |
| [ ] | Indexes created | ☐ | Performance critical |

### 3.2 Database Backup

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | Backup script created | ☐ | |
| [ ] | Backup cron job scheduled | ☐ | Daily at 3 AM |
| [ ] | Backup storage location confirmed | ☐ | Off-site preferred |
| [ ] | Backup restoration tested | ☐ | Critical! |
| [ ] | 7-day retention policy | ☐ | |

### 3.3 Redis Configuration

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | Redis 7+ running | ☐ | |
| [ ] | Persistence enabled (AOF) | ☐ | |
| [ ] | Max memory: 2GB | ☐ | |
| [ ] | Eviction policy: allkeys-lru | ☐ | |
| [ ] | Password protected | ☐ | |

---

## PHASE 4: APPLICATION CONFIGURATION

### 4.1 Environment Variables

| Variable | Status | Value Verified |
|----------|--------|----------------|
| [ ] | APP_NAME | ☐ |
| [ ] | ENVIRONMENT=production | ☐ |
| [ ] | DEBUG=false | ☐ |
| [ ] | SECRET_KEY | ☐ |
| [ ] | DATABASE_URL | ☐ |
| [ ] | REDIS_URL | ☐ |
| [ ] | ODDS_API_KEY | ☐ |
| [ ] | JWT_SECRET_KEY | ☐ |
| [ ] | KELLY_FRACTION=0.25 | ☐ |
| [ ] | MAX_BET_PERCENT=0.02 | ☐ |
| [ ] | SIGNAL_TIER_A_MIN=0.65 | ☐ |

### 4.2 ML Configuration

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | H2O_MAX_MEM_SIZE=32g | ☐ | |
| [ ] | AUTOGLUON_PRESET=best_quality | ☐ | |
| [ ] | GPU enabled for training | ☐ | |
| [ ] | Model storage directory exists | ☐ | `/opt/models` |
| [ ] | Model permissions correct | ☐ | |

### 4.3 External APIs

| API | Key Configured | Connection Tested |
|-----|----------------|-------------------|
| [ ] | TheOddsAPI | ☐ | ☐ |
| [ ] | ESPN API | ☐ (no key) | ☐ |
| [ ] | Weather API | ☐ | ☐ |

---

## PHASE 5: DATA READINESS

### 5.1 Initial Data Load

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | Sports table seeded (10 sports) | ☐ | |
| [ ] | Teams table populated | ☐ | All leagues |
| [ ] | Historical games loaded | ☐ | 5-10 years |
| [ ] | Historical odds loaded | ☐ | If available |
| [ ] | ELO ratings initialized | ☐ | |

### 5.2 Data Collection Jobs

| Job | Configured | Schedule Verified |
|-----|------------|-------------------|
| [ ] | Odds collection | ☐ | Every 60 seconds |
| [ ] | Game schedules | ☐ | Every 5 minutes |
| [ ] | Score updates | ☐ | Every 15 minutes |
| [ ] | Prediction grading | ☐ | Every 15 minutes |

---

## PHASE 6: ML MODELS

### 6.1 Model Training

| Item | Requirement | Verified | Notes |
|------|-------------|----------|-------|
| [ ] | Training data prepared | ☐ | Walk-forward splits |
| [ ] | H2O model trained | ☐ | Per sport |
| [ ] | AutoGluon model trained | ☐ | Per sport |
| [ ] | Models validated | ☐ | AUC > 0.60 |
| [ ] | Models calibrated | ☐ | Isotonic regression |
| [ ] | Meta-weights calculated | ☐ | |

### 6.2 Model Deployment

| Sport | Model Trained | Validated | Deployed |
|-------|---------------|-----------|----------|
| [ ] | NFL | ☐ | ☐ | ☐ |
| [ ] | NBA | ☐ | ☐ | ☐ |
| [ ] | MLB | ☐ | ☐ | ☐ |
| [ ] | NHL | ☐ | ☐ | ☐ |
| [ ] | NCAAF | ☐ | ☐ | ☐ |
| [ ] | NCAAB | ☐ | ☐ | ☐ |
| [ ] | CFL | ☐ | ☐ | ☐ |
| [ ] | WNBA | ☐ | ☐ | ☐ |
| [ ] | ATP | ☐ | ☐ | ☐ |
| [ ] | WTA | ☐ | ☐ | ☐ |

---

## PHASE 7: MONITORING & ALERTING

### 7.1 Monitoring Stack

| Component | Configured | Running |
|-----------|------------|---------|
| [ ] | Prometheus | ☐ | ☐ |
| [ ] | Grafana | ☐ | ☐ |
| [ ] | Node Exporter | ☐ | ☐ |
| [ ] | PostgreSQL Exporter | ☐ | ☐ |
| [ ] | Redis Exporter | ☐ | ☐ |

### 7.2 Dashboards

| Dashboard | Created | Verified |
|-----------|---------|----------|
| [ ] | System Overview | ☐ | ☐ |
| [ ] | API Performance | ☐ | ☐ |
| [ ] | ML Model Performance | ☐ | ☐ |
| [ ] | Prediction Accuracy | ☐ | ☐ |
| [ ] | Betting Performance | ☐ | ☐ |

### 7.3 Alerting

| Alert Channel | Configured | Test Sent |
|---------------|------------|-----------|
| [ ] | Telegram | ☐ | ☐ |
| [ ] | Slack | ☐ | ☐ |
| [ ] | Email | ☐ | ☐ |

### 7.4 Alert Rules

| Alert | Threshold | Configured |
|-------|-----------|------------|
| [ ] | API latency > 2s | ☐ |
| [ ] | Error rate > 1% | ☐ |
| [ ] | CPU > 80% | ☐ |
| [ ] | Memory > 80% | ☐ |
| [ ] | Disk > 80% | ☐ |
| [ ] | Model accuracy drop > 5% | ☐ |
| [ ] | Data collection failure | ☐ |

---

## PHASE 8: TESTING VERIFICATION

### 8.1 Test Suite

| Test Type | Passed | Coverage |
|-----------|--------|----------|
| [ ] | Unit tests | ☐ | > 80% |
| [ ] | Integration tests | ☐ | |
| [ ] | API tests | ☐ | All endpoints |
| [ ] | ML tests | ☐ | |
| [ ] | Load tests | ☐ | 100 req/s |

### 8.2 Smoke Tests

| Test | Passed |
|------|--------|
| [ ] | API health endpoint | ☐ |
| [ ] | Database connection | ☐ |
| [ ] | Redis connection | ☐ |
| [ ] | Odds collection | ☐ |
| [ ] | Prediction generation | ☐ |
| [ ] | User authentication | ☐ |

---

## PHASE 9: DOCUMENTATION

### 9.1 Documentation Complete

| Document | Available |
|----------|-----------|
| [ ] | System architecture | ☐ |
| [ ] | API documentation | ☐ |
| [ ] | Runbooks | ☐ |
| [ ] | Troubleshooting guide | ☐ |
| [ ] | Recovery procedures | ☐ |

### 9.2 Credentials Documented

| Credential | Documented Securely |
|------------|---------------------|
| [ ] | Database credentials | ☐ |
| [ ] | API keys | ☐ |
| [ ] | SSH keys | ☐ |
| [ ] | SSL certificates | ☐ |

---

## PHASE 10: FINAL VERIFICATION

### 10.1 System Health

```bash
# Run these commands and verify output
docker-compose ps                    # All services "Up (healthy)"
curl localhost:8000/api/v1/health    # {"status": "healthy"}
docker-compose exec api pytest       # All tests pass
```

### 10.2 Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| DevOps Lead | | | |
| Backend Lead | | | |
| ML Lead | | | |
| Security Lead | | | |
| Project Manager | | | |

---

## DEPLOYMENT COMMAND

Once all items are verified:

```bash
# Final deployment
cd /opt/ai-pro-sports
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
docker-compose ps
curl https://yourdomain.com/api/v1/health
```

---

## POST-DEPLOYMENT

| Item | Completed |
|------|-----------|
| [ ] | Monitor for 1 hour | ☐ |
| [ ] | Verify all services healthy | ☐ |
| [ ] | Test prediction generation | ☐ |
| [ ] | Confirm alerts working | ☐ |
| [ ] | Update status page | ☐ |

---

**Checklist Version:** 2.0  
**Last Updated:** January 2026
