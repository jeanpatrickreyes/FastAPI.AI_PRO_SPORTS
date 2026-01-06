# AI PRO SPORTS - Docker, Deployment, and Environments

## Document Information
- **Version**: 2.0
- **Last Updated**: January 2026
- **Classification**: Enterprise Documentation

---

## 1. Service Decomposition

### 1.1 Container Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       LOAD BALANCER                              │
│                     (SSL Termination)                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                        NGINX                                     │
│              (Reverse Proxy / Static Assets)                     │
└────┬─────────────────┬─────────────────┬────────────────────────┘
     │                 │                 │
     ▼                 ▼                 ▼
┌─────────┐      ┌─────────┐      ┌─────────┐
│   API   │      │   API   │      │   API   │
│  (1-N)  │      │  (1-N)  │      │  (1-N)  │
└────┬────┘      └────┬────┘      └────┬────┘
     │                │                │
     └────────────────┼────────────────┘
                      │
     ┌────────────────┼────────────────┐
     │                │                │
     ▼                ▼                ▼
┌─────────┐      ┌─────────┐      ┌─────────┐
│  Redis  │      │PostgreSQL│     │ Worker  │
│ Cluster │      │ Primary  │      │  (1-N)  │
└─────────┘      └────┬────┘      └─────────┘
                      │
                      ▼
                ┌─────────┐
                │PostgreSQL│
                │ Replica  │
                └─────────┘
```

### 1.2 Service Inventory

| Service Name | Image | Purpose | Replicas | Resources |
|--------------|-------|---------|----------|-----------|
| api | ai-pro-sports-api | FastAPI application server | 3-10 (auto) | 2 CPU, 4GB RAM |
| worker | ai-pro-sports-worker | Background task processing | 2-5 (auto) | 4 CPU, 8GB RAM |
| scheduler | ai-pro-sports-scheduler | Scheduled job orchestration | 1 | 1 CPU, 2GB RAM |
| ml-trainer | ai-pro-sports-trainer | Model training workloads | 1 | 24 CPU, 64GB RAM, 1 GPU |
| postgres | postgres:15 | Primary database | 1 | 4 CPU, 16GB RAM |
| postgres-replica | postgres:15 | Read replica | 1-2 | 2 CPU, 8GB RAM |
| redis | redis:7 | Cache and message broker | 3 (cluster) | 2 CPU, 8GB RAM |
| nginx | nginx:alpine | Reverse proxy | 2 | 1 CPU, 1GB RAM |
| prometheus | prom/prometheus | Metrics collection | 1 | 1 CPU, 2GB RAM |
| grafana | grafana/grafana | Visualization dashboards | 1 | 1 CPU, 2GB RAM |
| alertmanager | prom/alertmanager | Alert routing | 1 | 0.5 CPU, 1GB RAM |

### 1.3 Container Image Specifications

#### API Service Image
**Base**: python:3.11-slim
**Build Stages**:
1. Dependencies installation (pip packages)
2. Application code copy
3. Static asset compilation
4. Final slim image with only runtime dependencies

**Environment Variables Required**:
- DATABASE_URL
- REDIS_URL
- SECRET_KEY
- ODDS_API_KEY
- JWT_SECRET

**Exposed Ports**: 8000

**Health Check**: GET /api/v1/health

#### Worker Service Image
**Base**: python:3.11-slim
**Additional Packages**: ML libraries (h2o, autogluon, scikit-learn)

**Environment Variables Required**:
- DATABASE_URL
- REDIS_URL
- H2O_MAX_MEM_SIZE
- MODEL_PATH

**Exposed Ports**: None (internal only)

**Health Check**: Redis queue connectivity

#### ML Trainer Image
**Base**: nvidia/cuda:12.1-runtime-ubuntu22.04
**Additional Packages**: Full ML stack with GPU support

**Environment Variables Required**:
- DATABASE_URL
- MODEL_OUTPUT_PATH
- TRAINING_DATA_PATH
- GPU_MEMORY_LIMIT

**Exposed Ports**: None

**Resource Requirements**: NVIDIA GPU with 24GB+ VRAM

---

## 2. Environment Layout

### 2.1 Development Environment

**Purpose**: Local developer workstations

**Infrastructure**:
- Single-node setup
- All services on localhost
- Mock external APIs optional
- Local PostgreSQL and Redis

**Configuration Characteristics**:
- DEBUG=true
- Hot reload enabled
- Verbose logging
- Reduced data retention
- Test API keys

**Resource Requirements**:
- Minimum: 16GB RAM, 4 CPU cores
- Recommended: 32GB RAM, 8 CPU cores
- Optional: NVIDIA GPU for ML development

### 2.2 Staging Environment

**Purpose**: Pre-production testing and QA

**Infrastructure**:
- Production-like configuration
- Isolated cloud resources
- Real external API connections (test keys)
- Full monitoring stack

**Configuration Characteristics**:
- DEBUG=false
- Production-like scaling (reduced replicas)
- Full logging with 7-day retention
- Anonymized production data snapshots

**Resource Allocation**:
- 50% of production capacity
- Single replica for most services
- Shared GPU for ML testing

### 2.3 Production Environment

**Purpose**: Live customer-facing deployment

**Infrastructure**:
- Multi-availability-zone deployment
- Auto-scaling enabled
- Full redundancy
- Geographic distribution (if required)

**Target Server**: Hetzner GEX131

| Component | Specification |
|-----------|---------------|
| GPU | NVIDIA RTX PRO 6000 (96GB VRAM) |
| CPU | 24-core Intel Xeon |
| RAM | 512GB DDR4 |
| Storage | 2TB NVMe SSD |
| Network | 1 Gbps unmetered |

**Configuration Characteristics**:
- DEBUG=false
- Auto-scaling policies active
- 30-day log retention
- Full monitoring and alerting
- Encrypted secrets

---

## 3. Orchestration Strategy

### 3.1 Service Discovery

**Method**: DNS-based service discovery

**Service Registry**:
| Service | Internal DNS | Port |
|---------|--------------|------|
| API | api.internal | 8000 |
| Worker | worker.internal | 9000 |
| Postgres Primary | postgres-primary.internal | 5432 |
| Postgres Replica | postgres-replica.internal | 5432 |
| Redis | redis.internal | 6379 |

**Health Check Integration**:
- Services register only when healthy
- Automatic deregistration on failure
- 10-second health check interval

### 3.2 Auto-Scaling Configuration

**API Service Scaling**:
| Metric | Scale Up | Scale Down | Cooldown |
|--------|----------|------------|----------|
| CPU | > 70% for 2 min | < 30% for 5 min | 300s |
| Memory | > 80% for 2 min | < 40% for 5 min | 300s |
| Request Rate | > 1000 RPS | < 200 RPS | 300s |
| Response Time | p95 > 500ms | p95 < 100ms | 300s |

**Limits**:
- Minimum replicas: 3
- Maximum replicas: 10

**Worker Service Scaling**:
| Metric | Scale Up | Scale Down | Cooldown |
|--------|----------|------------|----------|
| Queue Depth | > 1000 messages | < 100 messages | 600s |
| Worker Utilization | > 80% | < 30% | 600s |

**Limits**:
- Minimum replicas: 2
- Maximum replicas: 5

### 3.3 Deployment Strategies

#### Rolling Deployment (Default)
**Configuration**:
- Max surge: 25%
- Max unavailable: 0
- Readiness probe grace period: 30 seconds
- Progress deadline: 600 seconds

**Process**:
1. Create new pods with updated image
2. Wait for readiness checks to pass
3. Route traffic to new pods
4. Terminate old pods
5. Monitor for rollback conditions

#### Blue/Green Deployment (Major Releases)
**Configuration**:
- Full parallel environment (Blue and Green)
- Traffic switch via load balancer
- Instant rollback capability

**Process**:
1. Deploy new version to inactive environment
2. Run smoke tests against new environment
3. Switch traffic to new environment
4. Monitor for 15 minutes
5. Decommission old environment or rollback

#### Canary Deployment (High-Risk Changes)
**Configuration**:
- Initial canary: 5% traffic
- Increments: 5% → 25% → 50% → 100%
- Automatic rollback on error threshold

**Process**:
1. Deploy canary pods (5%)
2. Monitor error rates and latency
3. If healthy, increase traffic incrementally
4. If unhealthy, automatic rollback
5. Full promotion after 1-hour observation

### 3.4 Zero-Downtime Deployment Requirements

**Pre-deployment Checks**:
- Database migrations backward compatible
- API changes additive (no breaking changes)
- Feature flags for gradual rollout
- Health checks passing

**Deployment Sequence**:
1. Run database migrations (backward compatible)
2. Deploy new API version
3. Update workers
4. Update scheduler
5. Verify all health checks
6. Clean up old resources

---

## 4. Configuration Management

### 4.1 Environment Variables

**Categories**:

#### Application Settings
| Variable | Description | Example |
|----------|-------------|---------|
| APP_NAME | Application identifier | AI PRO SPORTS |
| APP_VERSION | Current version | 2.0.0 |
| ENVIRONMENT | Runtime environment | production |
| DEBUG | Debug mode flag | false |
| LOG_LEVEL | Logging verbosity | INFO |

#### Database Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | Primary database connection | postgresql+asyncpg://user:pass@host:5432/db |
| DATABASE_POOL_SIZE | Connection pool size | 20 |
| DATABASE_POOL_OVERFLOW | Overflow connections | 10 |
| DATABASE_POOL_TIMEOUT | Connection timeout | 30 |
| DATABASE_REPLICA_URL | Read replica connection | postgresql+asyncpg://user:pass@replica:5432/db |

#### Cache Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| REDIS_URL | Redis connection string | redis://localhost:6379/0 |
| CACHE_TTL_DEFAULT | Default cache TTL | 300 |
| CACHE_TTL_PREDICTIONS | Prediction cache TTL | 60 |
| CACHE_TTL_ODDS | Odds cache TTL | 30 |

#### External API Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| ODDS_API_KEY | TheOddsAPI key | (secret) |
| ODDS_API_BASE_URL | API base URL | https://api.the-odds-api.com/v4 |
| ESPN_API_KEY | ESPN API key | (secret) |
| WEATHER_API_KEY | Weather service key | (secret) |

#### ML Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| H2O_MAX_MEM_SIZE | H2O memory allocation | 32g |
| H2O_MAX_MODELS | Maximum models to train | 50 |
| H2O_MAX_RUNTIME_SECS | Training time limit | 3600 |
| MODEL_PATH | Model storage location | /models |
| AUTOGLUON_PRESET | AutoGluon quality preset | best_quality |

#### Betting Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| KELLY_FRACTION | Kelly criterion fraction | 0.25 |
| MAX_BET_PERCENT | Maximum bet percentage | 0.02 |
| MIN_EDGE_THRESHOLD | Minimum edge required | 0.03 |
| SIGNAL_TIER_A_MIN | Tier A minimum confidence | 0.65 |
| SIGNAL_TIER_B_MIN | Tier B minimum confidence | 0.60 |
| SIGNAL_TIER_C_MIN | Tier C minimum confidence | 0.55 |

### 4.2 Secrets Management

**Secret Categories**:
| Secret Type | Storage Method | Rotation Policy |
|-------------|---------------|-----------------|
| Database credentials | Secrets manager | Quarterly |
| API keys (external) | Secrets manager | Annually |
| JWT signing key | Secrets manager | Monthly |
| Encryption keys | HSM/Vault | Annually |
| Service account keys | Secrets manager | Quarterly |

**Access Controls**:
- Secrets accessible only by designated services
- Audit logging for all secret access
- No secrets in environment variables in plain text
- Encrypted at rest and in transit

### 4.3 Per-Environment Configuration

**Configuration Hierarchy**:
1. Default values (in application code)
2. Environment-specific config files
3. Environment variables
4. Secrets manager (highest priority)

**Environment-Specific Overrides**:

| Setting | Development | Staging | Production |
|---------|-------------|---------|------------|
| LOG_LEVEL | DEBUG | INFO | INFO |
| DATABASE_POOL_SIZE | 5 | 10 | 20 |
| CACHE_TTL_DEFAULT | 60 | 180 | 300 |
| RATE_LIMIT_PER_MIN | 1000 | 200 | 100 |
| ALERT_CHANNELS | console | slack | slack,pagerduty |

---

## 5. Network Architecture

### 5.1 Network Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │  FIREWALL │
                    │ (WAF/DDoS)│
                    └─────┬─────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   PUBLIC SUBNET                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              LOAD BALANCER                               │    │
│  │         (SSL Termination, HTTPS only)                    │    │
│  └─────────────────────┬───────────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   PRIVATE SUBNET (Application)                   │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │  NGINX  │    │   API   │    │ Worker  │    │Scheduler│       │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   PRIVATE SUBNET (Data)                          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                      │
│  │PostgreSQL│   │  Redis  │    │ Storage │                      │
│  └─────────┘    └─────────┘    └─────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Firewall Rules

**Inbound Rules (Public)**:
| Protocol | Port | Source | Purpose |
|----------|------|--------|---------|
| HTTPS | 443 | 0.0.0.0/0 | API and web traffic |
| HTTP | 80 | 0.0.0.0/0 | Redirect to HTTPS |

**Inbound Rules (Application Subnet)**:
| Protocol | Port | Source | Purpose |
|----------|------|--------|---------|
| TCP | 8000 | Load balancer | API traffic |
| TCP | 9000 | Internal | Worker management |

**Inbound Rules (Data Subnet)**:
| Protocol | Port | Source | Purpose |
|----------|------|--------|---------|
| TCP | 5432 | Application subnet | PostgreSQL |
| TCP | 6379 | Application subnet | Redis |

**Egress Rules**:
| Protocol | Port | Destination | Purpose |
|----------|------|-------------|---------|
| HTTPS | 443 | External APIs | Data collection |
| DNS | 53 | DNS servers | Name resolution |
| NTP | 123 | NTP servers | Time sync |

### 5.3 SSL/TLS Configuration

**Certificate Management**:
- Provider: Let's Encrypt (auto-renewal)
- Validity: 90 days (auto-renewed at 30 days)
- Key size: RSA 2048-bit minimum
- Renewal automation: Certbot or equivalent

**TLS Settings**:
- Minimum version: TLS 1.2
- Preferred version: TLS 1.3
- Cipher suites: Modern secure ciphers only
- HSTS enabled: max-age=31536000; includeSubDomains

### 5.4 Load Balancer Configuration

**Health Check Settings**:
| Setting | Value |
|---------|-------|
| Path | /api/v1/health |
| Protocol | HTTP |
| Port | 8000 |
| Interval | 10 seconds |
| Timeout | 5 seconds |
| Healthy threshold | 2 checks |
| Unhealthy threshold | 3 checks |

**Traffic Distribution**:
- Algorithm: Round-robin with sticky sessions (optional)
- Connection draining: 30 seconds
- Idle timeout: 60 seconds

---

## 6. Backup and Disaster Recovery

### 6.1 Backup Strategy

**PostgreSQL Backups**:
| Type | Frequency | Retention | Storage |
|------|-----------|-----------|---------|
| Full snapshot | Daily 4 AM UTC | 30 days | Object storage |
| WAL archiving | Continuous | 7 days | Object storage |
| Point-in-time | Continuous | 7 days | Object storage |

**Redis Backups**:
| Type | Frequency | Retention |
|------|-----------|-----------|
| RDB snapshot | Every 15 minutes | 24 hours |
| AOF persistence | Continuous | Real-time |

**Model Artifacts**:
| Type | Frequency | Retention |
|------|-----------|-----------|
| Production models | On promotion | Forever |
| Training artifacts | On completion | 90 days |

### 6.2 Recovery Procedures

**Database Recovery**:
| Scenario | RTO | RPO | Procedure |
|----------|-----|-----|-----------|
| Data corruption | 2 hours | 15 minutes | Point-in-time recovery |
| Hardware failure | 1 hour | 5 minutes | Failover to replica |
| Region failure | 4 hours | 1 hour | Cross-region restore |

**Application Recovery**:
| Scenario | RTO | Procedure |
|----------|-----|-----------|
| Container failure | 2 minutes | Auto-restart |
| Service degradation | 5 minutes | Auto-scaling |
| Full outage | 30 minutes | Redeploy from images |

---

## 7. Monitoring Infrastructure

### 7.1 Prometheus Configuration

**Scrape Targets**:
| Target | Endpoint | Interval |
|--------|----------|----------|
| API servers | /metrics | 15s |
| Workers | /metrics | 15s |
| PostgreSQL | postgres_exporter | 30s |
| Redis | redis_exporter | 15s |
| Node | node_exporter | 30s |
| NVIDIA GPU | dcgm_exporter | 30s |

**Retention**: 15 days local, long-term in object storage

### 7.2 Grafana Dashboards

**Dashboard Inventory**:
1. **System Overview**: CPU, memory, disk, network across all services
2. **API Performance**: Request rates, latency percentiles, error rates
3. **ML Pipeline**: Training jobs, inference latency, model accuracy
4. **Database Health**: Connections, query performance, replication lag
5. **Prediction Performance**: Accuracy by sport, CLV tracking, ROI
6. **Betting Analytics**: Volume, edge distribution, bankroll growth
7. **Data Quality**: Freshness, completeness, anomaly counts
8. **Alert Overview**: Active alerts, alert history, acknowledgments
9. **Business Metrics**: User engagement, API usage, revenue indicators
10. **Infrastructure Costs**: Resource utilization, scaling events

### 7.3 Alertmanager Configuration

**Alert Routing**:
| Severity | Channel | Response Time |
|----------|---------|---------------|
| Critical | PagerDuty + Slack | Immediate (24/7) |
| Warning | Slack | Business hours |
| Info | Email digest | Daily summary |

**Alert Grouping**:
- Group by: service, severity
- Group wait: 30 seconds
- Group interval: 5 minutes
- Repeat interval: 4 hours

---

*End of Deployment Document*
