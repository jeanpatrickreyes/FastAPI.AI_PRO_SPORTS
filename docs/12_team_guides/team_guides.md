# AI PRO SPORTS - Team Documentation Guides

## Document Information
- **Version**: 2.0
- **Last Updated**: January 2026
- **Classification**: Enterprise Documentation

---

## 1. Data Engineering Guide

### 1.1 Overview
This guide is for data engineers responsible for data pipelines, ETL processes, schema management, and data quality within the AI PRO SPORTS platform.

### 1.2 Key Responsibilities

- Maintain data collection pipelines from external sources
- Ensure data quality and validation
- Manage database schemas and migrations
- Optimize query performance
- Handle data backfill and historical data management
- Monitor data freshness and completeness

### 1.3 Data Sources and Pipelines

**External Data Sources**:
| Source | Data Types | Refresh Rate | Pipeline Name |
|--------|------------|--------------|---------------|
| TheOddsAPI | Odds, lines | 60 seconds | odds_collector |
| ESPN API | Games, stats, injuries | 5 minutes | espn_collector |
| Weather API | Game weather | 4 hours | weather_collector |
| Statcast | Advanced baseball metrics | Daily | statcast_batch |

**Pipeline Architecture**:
```
External API → Collector → Raw Storage → Validator → Staging → Curated → Feature Store
```

**Key Pipelines to Maintain**:
1. **Odds Collection Pipeline**: Real-time odds ingestion
2. **Game Data Pipeline**: Schedules, scores, results
3. **Feature Engineering Pipeline**: Compute ML features
4. **Historical Backfill Pipeline**: Load historical data

### 1.4 Schema Management

**Schema Change Process**:
1. Create migration script
2. Test migration in development
3. Review by peer engineer
4. Apply to staging with data verification
5. Schedule production deployment (typically during low-traffic periods)
6. Execute migration with rollback plan ready

**Key Tables to Know**:
| Table | Purpose | Update Frequency |
|-------|---------|------------------|
| games | Game records | Real-time |
| odds | Odds snapshots | Every 60 seconds |
| game_features | ML features per game | Hourly |
| predictions | Model predictions | On-demand |
| closing_lines | Closing line captures | Pre-game |

### 1.5 Data Quality Rules

**Critical Data Quality Checks**:
| Check | Rule | Action on Failure |
|-------|------|-------------------|
| Odds completeness | > 90% of games have odds | Alert |
| Score consistency | Scores match across sources | Alert + manual review |
| Feature completeness | > 98% features populated | Block prediction |
| Data freshness | Odds < 2 min old | Alert |

**Data Quality Dashboard**: Grafana > Data Quality

### 1.6 Common Tasks

**Backfill Historical Data**:
1. Identify missing date ranges
2. Configure backfill pipeline parameters
3. Run backfill with `is_backfill=true` flag
4. Validate backfilled data quality
5. Update feature calculations for backfilled games

**Investigate Data Anomalies**:
1. Check Data Quality dashboard for alerts
2. Query raw data to identify source
3. Verify with external source
4. Correct data or mark as invalid
5. Document in data quality log

### 1.7 Useful Queries

**Check Data Freshness**:
```
Purpose: Find latest odds update time by sport
Table: odds
Key columns: sport_id, recorded_at
```

**Identify Missing Games**:
```
Purpose: Find games without odds
Tables: games, odds (LEFT JOIN)
Key columns: game_id, sport_id, scheduled_time
```

**Data Volume Trends**:
```
Purpose: Daily record counts by table
Tables: All main tables
Key columns: created_at (date grouped)
```

---

## 2. ML Engineering Guide

### 2.1 Overview
This guide is for ML engineers responsible for model development, training, evaluation, and deployment within the AI PRO SPORTS platform.

### 2.2 Key Responsibilities

- Develop and improve prediction models
- Train models using the hybrid AutoML pipeline
- Evaluate model performance using walk-forward validation
- Deploy models to production
- Monitor model accuracy and drift
- Maintain feature engineering logic

### 2.3 ML Architecture

**Meta-Ensemble Structure**:
```
H2O AutoML (35%) + AutoGluon (45%) + Sklearn Ensemble (20%) → Calibration → Final Prediction
```

**Model Types by Prediction**:
| Prediction Type | Model Approach | Target Variable |
|-----------------|----------------|-----------------|
| Spread | Binary classification | Cover/Not cover |
| Moneyline | Binary classification | Win/Lose |
| Total | Binary classification | Over/Under |
| Player Props | Regression + threshold | Player stat value |

### 2.4 Feature Catalog Reference

**Feature Categories**:
1. Team Performance (ELO, ratings, efficiency)
2. Recent Form (last 5/10 games stats)
3. Rest and Travel (days off, distance)
4. Head-to-Head (historical matchup stats)
5. Line Movement (opening vs current, steam)
6. Weather (temperature, wind, precipitation)
7. Situational (home/away, divisional, prime time)
8. Advanced Metrics (sport-specific advanced stats)

**Feature Naming Convention**: `{category}_{metric}_{window}`

**Example**: `form_avg_margin_last5`

### 2.5 Training Pipeline

**Training Workflow**:
1. **Data Preparation**: Query training data from feature store
2. **Split Creation**: Walk-forward splits with temporal isolation
3. **H2O Training**: Run AutoML with 50-model limit
4. **AutoGluon Training**: Run multi-stack ensemble
5. **Sklearn Training**: Train voting classifier ensemble
6. **Meta-Weight Calculation**: Compute validation-based weights
7. **Calibration**: Fit isotonic regression calibrator
8. **Evaluation**: Run comprehensive metrics suite
9. **Model Registration**: Store in model registry with metadata

**Training Configuration Parameters**:
| Parameter | Default | Description |
|-----------|---------|-------------|
| training_window_days | 365 | Historical days for training |
| validation_window_days | 30 | Days for validation |
| h2o_max_models | 50 | Maximum H2O models |
| h2o_max_runtime_secs | 3600 | H2O time limit |
| autogluon_preset | best_quality | AutoGluon quality level |
| autogluon_time_limit | 3600 | AutoGluon time limit |

### 2.6 Model Evaluation

**Required Metrics**:
| Metric | Tier A Target | Overall Target |
|--------|---------------|----------------|
| Accuracy | 65%+ | 55%+ |
| AUC-ROC | 0.68+ | 0.58+ |
| Log Loss | < 0.65 | < 0.68 |
| Brier Score | < 0.22 | < 0.24 |
| ECE (Calibration) | < 0.04 | < 0.06 |
| CLV | > +1.5% | > +0.5% |

**Evaluation Reports Generated**:
1. Walk-forward validation summary
2. Calibration reliability diagram
3. Feature importance ranking
4. SHAP summary plots
5. Accuracy by sport/bet type breakdown
6. ROI backtesting results

### 2.7 Model Deployment

**Promotion Workflow**:
1. Model passes all evaluation thresholds
2. Create promotion request with metrics
3. ML lead reviews and approves
4. Deploy to staging for shadow testing
5. Compare predictions to production model
6. If challenger wins, promote to production
7. Monitor for 24 hours post-promotion

**Rollback Triggers**:
- Accuracy drops > 5% from baseline
- Error rate > 1% of predictions
- Latency increases > 2x

### 2.8 Experiment Tracking

**Experiment Metadata to Track**:
- Experiment name and hypothesis
- Training data date range
- Feature set version
- Hyperparameters used
- All evaluation metrics
- Training time and resources
- Conclusion and learnings

### 2.9 Common Tasks

**Retrain Model for Specific Sport**:
1. Check data completeness for sport
2. Configure training parameters
3. Launch training job
4. Monitor training progress
5. Review evaluation metrics
6. Decision: promote or iterate

**Investigate Accuracy Drop**:
1. Check model monitoring dashboard
2. Identify affected sport/bet type
3. Analyze recent prediction samples
4. Check feature distributions for drift
5. Compare to recent training data
6. Decision: retrain or feature fix

---

## 3. Backend Engineering Guide

### 3.1 Overview
This guide is for backend engineers responsible for API development, service architecture, and core application functionality.

### 3.2 Key Responsibilities

- Develop and maintain API endpoints
- Implement business logic services
- Manage authentication and authorization
- Ensure API performance and reliability
- Integrate with ML models and data services
- Handle third-party service integrations

### 3.3 API Architecture

**Technology Stack**:
- Framework: FastAPI (Python 3.11+)
- ORM: SQLAlchemy 2.0 (async)
- Validation: Pydantic v2
- Authentication: JWT tokens
- Documentation: OpenAPI (auto-generated)

**Service Structure**:
```
API Routes → Request Validation → Service Layer → Repository Layer → Database
                      ↓
               Domain Logic
                      ↓
               External Services (ML, Cache, External APIs)
```

### 3.4 API Endpoint Categories

| Category | Path Prefix | Auth Required | Description |
|----------|-------------|---------------|-------------|
| Auth | /api/v1/auth | No (except logout) | Authentication endpoints |
| Predictions | /api/v1/predictions | Yes | Prediction CRUD and queries |
| Games | /api/v1/games | Yes | Game information |
| Odds | /api/v1/odds | Yes | Odds data and history |
| Betting | /api/v1/betting | Yes | Bankroll and bet tracking |
| Player Props | /api/v1/player-props | Yes | Player prop predictions |
| Admin | /api/v1/admin | Admin role | Administrative functions |
| Health | /api/v1/health | No | Health check endpoints |

### 3.5 Authentication Flow

**Login Flow**:
1. Client sends email/password to /auth/login
2. Server validates credentials
3. If 2FA enabled, return partial token requiring 2FA code
4. Client sends 2FA code to /auth/2fa/verify
5. Server returns access token + refresh token
6. Access token used in Authorization header

**Token Refresh Flow**:
1. Access token expires (15 min)
2. Client sends refresh token to /auth/refresh
3. Server validates refresh token
4. Server returns new access/refresh token pair
5. Old refresh token invalidated

### 3.6 Request/Response Patterns

**Standard Response Format**:
```
Success: { "data": {...}, "meta": {...} }
Error: { "error": { "code": "...", "message": "...", "details": {...} } }
List: { "data": [...], "meta": { "total": N, "page": P, "limit": L } }
```

**Pagination Parameters**:
- `page`: Page number (1-indexed)
- `limit`: Items per page (default 20, max 100)
- `sort`: Sort field
- `order`: asc/desc

**Common Query Parameters**:
- `sport`: Filter by sport code
- `date`: Filter by date (YYYY-MM-DD)
- `date_from`/`date_to`: Date range
- `tier`: Filter by signal tier (A, B, C, D)

### 3.7 Service Layer Patterns

**Service Structure**:
```
PredictionService
├── get_predictions(filters)
├── get_prediction_by_id(id)
├── generate_predictions(game_ids)
├── verify_prediction_hash(prediction_id)
└── _calculate_edge(prediction, odds)
```

**Dependency Injection**:
- Services receive dependencies via constructor
- Use FastAPI's Depends() for route dependencies
- Repository interfaces for testability

### 3.8 Error Handling

**Error Categories**:
| HTTP Code | Category | When to Use |
|-----------|----------|-------------|
| 400 | Bad Request | Invalid input, validation failure |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Business rule violation |
| 422 | Unprocessable | Valid syntax but semantic error |
| 500 | Internal Error | Unexpected server error |

**Error Response Format**:
```
{
  "error": {
    "code": "PREDICTION_NOT_FOUND",
    "message": "Prediction with ID {id} not found",
    "details": { "prediction_id": "..." }
  }
}
```

### 3.9 Caching Strategy

**Cache Layers**:
| Data Type | Cache Location | TTL | Invalidation |
|-----------|----------------|-----|--------------|
| User session | Redis | 30 min | On logout |
| Predictions | Redis | 5 min | On new prediction |
| Odds | Redis | 30 sec | On odds update |
| Game info | Redis | 1 hour | On game update |
| Model artifacts | Memory | 24 hours | On model promotion |

### 3.10 Common Tasks

**Add New API Endpoint**:
1. Define Pydantic request/response schemas
2. Create route handler with proper decorators
3. Implement service method if needed
4. Add integration tests
5. Update API documentation
6. Code review and merge

**Debug Performance Issue**:
1. Check API latency metrics (Grafana)
2. Identify slow endpoints
3. Profile with request tracing
4. Check database query plans
5. Verify cache hit rates
6. Optimize or escalate

---

## 4. DevOps/SRE Guide

### 4.1 Overview
This guide is for DevOps and SRE team members responsible for infrastructure, deployment, monitoring, and reliability.

### 4.2 Key Responsibilities

- Manage deployment pipelines and releases
- Monitor system health and performance
- Respond to incidents and alerts
- Maintain infrastructure as code
- Optimize resource utilization
- Ensure system security and compliance

### 4.3 Infrastructure Overview

**Production Environment**:
- **Server**: Hetzner GEX131 (24 CPU, 512GB RAM, RTX PRO 6000 GPU)
- **Containers**: Docker with Docker Compose (or Kubernetes)
- **Database**: PostgreSQL 15 (primary + replica)
- **Cache**: Redis 7 (cluster mode)
- **Reverse Proxy**: Nginx with SSL termination
- **Monitoring**: Prometheus + Grafana + Alertmanager

### 4.4 Deployment Topology

```
Internet → Load Balancer → Nginx (2x) → API (3-10x) → PostgreSQL/Redis
                                      → Worker (2-5x)
                                      → Scheduler (1x)
```

**Container Resources**:
| Service | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---------|-------------|-----------|----------------|--------------|
| api | 1 | 2 | 2Gi | 4Gi |
| worker | 2 | 4 | 4Gi | 8Gi |
| scheduler | 0.5 | 1 | 1Gi | 2Gi |
| ml-trainer | 16 | 24 | 32Gi | 64Gi |

### 4.5 Key Dashboards

**Dashboard Inventory**:
1. **System Overview**: CPU, memory, disk, network
2. **API Performance**: Request rate, latency, errors
3. **Database Health**: Connections, query time, replication
4. **Redis Metrics**: Hit rate, memory, commands/sec
5. **ML Pipeline**: Training jobs, inference latency
6. **Prediction Accuracy**: Win rate by sport/tier
7. **Data Quality**: Freshness, completeness, anomalies
8. **Business Metrics**: Predictions generated, API usage

### 4.6 Alert Response Procedures

**SEV1 Alert (Critical)**:
1. Acknowledge within 5 minutes
2. Assess impact scope
3. Begin mitigation (rollback if recent deployment)
4. Update status page
5. Engage additional resources if needed
6. Resolve and document

**Common Alert Responses**:
| Alert | First Action | Escalation |
|-------|--------------|------------|
| API High Error Rate | Check recent deployments, rollback if needed | Engineering lead |
| Database CPU High | Identify slow queries, terminate if blocking | DBA |
| Disk Space Low | Clear logs, extend volume | Infrastructure lead |
| Model Serving Down | Restart container, check model artifacts | ML team |

### 4.7 Runbook Quick Reference

| Scenario | Runbook Location | Key Steps |
|----------|------------------|-----------|
| Data ingestion failure | runbooks/data-ingestion.md | Check API status, verify credentials |
| Model serving outage | runbooks/model-serving.md | Restart container, verify GPU |
| Database failover | runbooks/database-failover.md | Promote replica, update connection |
| Full site outage | runbooks/site-outage.md | Check all services, network, DNS |

### 4.8 Deployment Commands

**Standard Deployment**:
```
Purpose: Deploy latest application version
Steps: Pull images → Rolling update → Verify health
Rollback: Revert to previous image tag
```

**Emergency Rollback**:
```
Purpose: Quick rollback to last known good version
Steps: Stop new deployment → Revert images → Restart services
Verification: Health check endpoints green
```

### 4.9 Maintenance Tasks

**Weekly**:
- Review and rotate logs
- Check backup integrity
- Review resource utilization trends
- Update dependency images

**Monthly**:
- Database vacuum and analyze
- SSL certificate expiration check
- Security patch application
- Capacity planning review

---

## 5. Product/Analytics Guide

### 5.1 Overview
This guide is for product managers and analysts tracking platform performance, user engagement, and business metrics.

### 5.2 Key Metrics

**Prediction Quality Metrics**:
| Metric | Definition | Target | Dashboard |
|--------|------------|--------|-----------|
| Accuracy (Tier A) | Win % for high-confidence predictions | > 65% | Prediction Performance |
| Accuracy (Overall) | Win % for all predictions | > 55% | Prediction Performance |
| CLV (Closing Line Value) | Edge vs closing line | > +1% | CLV Tracking |
| ROI | Return on investment if betting | > +3% | Betting Performance |

**Platform Metrics**:
| Metric | Definition | Target | Dashboard |
|--------|------------|--------|-----------|
| Daily Active Users | Unique users per day | Growth | User Analytics |
| Predictions Viewed | Daily prediction views | Engagement | User Analytics |
| API Requests | Total API calls | Capacity | API Performance |
| Alert Engagement | Alert click-through rate | > 15% | Alert Analytics |

**Operational Metrics**:
| Metric | Definition | Target | Dashboard |
|--------|------------|--------|-----------|
| Uptime | System availability | > 99.9% | System Overview |
| API Latency (p95) | 95th percentile response time | < 200ms | API Performance |
| Data Freshness | Age of odds data | < 2 min | Data Quality |

### 5.3 Key Reports

**Daily Reports**:
- Yesterday's prediction results
- Accuracy breakdown by sport/tier
- Top performing predictions
- Notable misses

**Weekly Reports**:
- Week-over-week accuracy trends
- CLV performance summary
- User engagement trends
- System performance summary

**Monthly Reports**:
- Monthly accuracy and ROI summary
- Model performance analysis
- User growth and retention
- Business KPI dashboard

### 5.4 Dashboard Access

**Grafana Dashboards**:
- URL: https://grafana.internal/
- Auth: SSO login
- Key dashboards: Prediction Performance, User Analytics, Business Metrics

**Data Export**:
- Prediction history available via admin API
- Historical reports in data warehouse
- Custom queries available upon request

### 5.5 KPI Definitions

**Prediction Performance KPIs**:
- **Tier A Accuracy**: Percentage of Tier A predictions that are correct
- **CLV**: Average edge captured vs closing line
- **ROI**: Net profit if all Tier A predictions were bet at recommended size
- **Sharp Agreement**: Percentage of predictions aligned with sharp bookmakers

**User Engagement KPIs**:
- **DAU/MAU**: Daily active users / Monthly active users
- **Session Duration**: Average time spent per session
- **Predictions per User**: Average predictions viewed per user per day
- **Alert Conversion**: Percentage of alerts that result in prediction view

---

*End of Team Documentation Guides*
