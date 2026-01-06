# AI PRO SPORTS - Data Ingestion and ETL/ELT Pipelines

## Document Information
- **Version**: 2.0
- **Last Updated**: January 2026
- **Classification**: Enterprise Documentation

---

## 1. External Data Sources

### 1.1 Sports Data Providers

#### 1.1.1 TheOddsAPI (Primary Odds Source)
**Data Provided**:
- Real-time odds from 40+ sportsbooks
- Spread, moneyline, and total markets
- Opening and current lines
- Historical odds snapshots

**Coverage**:
- NFL, NCAAF, NBA, NCAAB, NHL, MLB, ATP, WTA
- CFL and WNBA (limited sportsbook coverage)

**API Specifications**:
- Protocol: REST API
- Authentication: API Key header
- Rate Limits: 500 requests/month (free), 10,000/month (standard), unlimited (enterprise)
- Response Format: JSON

**Sport Code Mapping**:
| Internal Code | TheOddsAPI Code |
|---------------|-----------------|
| NFL | americanfootball_nfl |
| NCAAF | americanfootball_ncaaf |
| NBA | basketball_nba |
| NCAAB | basketball_ncaab |
| NHL | icehockey_nhl |
| MLB | baseball_mlb |
| ATP | tennis_atp |
| WTA | tennis_wta |

#### 1.1.2 ESPN API (Primary Stats Source)
**Data Provided**:
- Game schedules and results
- Team standings and records
- Player statistics
- Play-by-play data
- Injury reports

**API Specifications**:
- Protocol: REST API
- Authentication: API Key
- Rate Limits: 1,000 requests/hour
- Response Format: JSON

#### 1.1.3 Statcast (Advanced Baseball Metrics)
**Data Provided**:
- Launch angle, exit velocity
- Sprint speed
- Pitch movement
- Expected statistics (xBA, xSLG, xwOBA)

**Delivery Method**: Batch files (daily)

#### 1.1.4 Weather Services
**Primary Provider**: OpenWeatherMap API

**Data Provided**:
- Temperature, humidity, wind speed/direction
- Precipitation probability
- Historical weather for game times

**Refresh Frequency**: 4 hours pre-game, hourly on game day

### 1.2 Data Source Priority Matrix

| Data Type | Primary Source | Secondary Source | Tertiary Source |
|-----------|---------------|------------------|-----------------|
| Odds | TheOddsAPI | Direct book feeds | Manual entry |
| Game Schedules | ESPN | League official | TheOddsAPI |
| Scores/Results | ESPN | League official | Media feeds |
| Team Stats | ESPN | Statcast | Calculated |
| Player Stats | ESPN | Statcast | Position feeds |
| Injuries | ESPN | Official team | News feeds |
| Weather | OpenWeatherMap | Weather.gov | Manual |

---

## 2. Ingestion Methods

### 2.1 REST API Polling
**Implementation Pattern**:
- Scheduled polling at configured intervals
- Exponential backoff on failures
- Rate limit tracking and throttling
- Response caching for duplicate prevention

**Frequency Configuration**:
| Data Type | Normal Frequency | Game Day Frequency |
|-----------|-----------------|-------------------|
| Odds | 60 seconds | 30 seconds |
| Schedules | 5 minutes | 5 minutes |
| Scores | 15 minutes | 60 seconds (live) |
| Injuries | 60 minutes | 30 minutes |

### 2.2 Webhook Receivers
**Supported Webhooks**:
- Score updates (push from provider)
- Line movement alerts
- Breaking injury news

**Webhook Processing**:
- Signature validation for authenticity
- Idempotency key tracking
- Message queue buffering
- Async processing pipeline

### 2.3 Batch File Processing
**Supported Formats**: CSV, JSON, Parquet

**Processing Schedule**:
- Historical data: Daily at 4:00 AM UTC
- Advanced metrics: Daily at 6:00 AM UTC
- End-of-season archives: Weekly during offseason

### 2.4 Rate Limit Handling

**Strategy**: Token Bucket with Adaptive Backoff

**Configuration**:
| Provider | Tokens/Period | Period | Backoff Base | Max Backoff |
|----------|--------------|--------|--------------|-------------|
| TheOddsAPI | 500 | month | 60s | 3600s |
| ESPN | 1000 | hour | 10s | 300s |
| Weather | 60 | minute | 5s | 60s |

**Backoff Formula**: wait_time = base × (2 ^ attempt_number) + random_jitter

---

## 3. Data Validation Framework

### 3.1 Schema Validation

**Validation Rules by Data Type**:

#### Odds Data Validation
| Field | Type | Constraints |
|-------|------|-------------|
| game_id | UUID | Required, must exist in games table |
| sportsbook_id | Integer | Required, must exist in sportsbooks table |
| recorded_at | Timestamp | Required, not future |
| spread_home | Decimal | Range: -50 to +50 |
| spread_away | Decimal | Inverse of spread_home |
| spread_odds_home | Integer | Range: -1000 to +1000 |
| spread_odds_away | Integer | Range: -1000 to +1000 |
| total_line | Decimal | Range: 30 to 400 (sport-specific) |
| moneyline_home | Integer | Range: -5000 to +5000 |
| moneyline_away | Integer | Range: -5000 to +5000 |

#### Game Data Validation
| Field | Type | Constraints |
|-------|------|-------------|
| external_id | String | Required, unique per source |
| sport_id | Integer | Required, valid sport code |
| home_team_id | Integer | Required, must exist |
| away_team_id | Integer | Required, must exist, different from home |
| scheduled_time | Timestamp | Required, not more than 1 year future |
| venue_id | Integer | Optional, must exist if provided |
| season_id | Integer | Required, valid season |

### 3.2 Range Checks

**Sport-Specific Ranges**:

| Sport | Min Total | Max Total | Max Spread | Min Score | Max Score |
|-------|-----------|-----------|------------|-----------|-----------|
| NFL | 30 | 70 | 30 | 0 | 80 |
| NBA | 180 | 260 | 25 | 70 | 175 |
| MLB | 5 | 15 | 5 | 0 | 30 |
| NHL | 4 | 8 | 3.5 | 0 | 15 |
| NCAAF | 30 | 85 | 45 | 0 | 90 |
| NCAAB | 100 | 180 | 35 | 40 | 130 |

### 3.3 Cross-Source Consistency Checks

**Reconciliation Rules**:
- Game existence: Game must exist in schedule before odds can be recorded
- Team consistency: Home/away teams must match across sources
- Score consistency: Final scores must match within tolerance across sources
- Time consistency: Game times must align within 30-minute tolerance

**Conflict Resolution**:
1. Primary source takes precedence
2. If primary unavailable, secondary source used
3. Conflicts logged for manual review
4. Automatic alerts for systematic mismatches

### 3.4 Null Handling Policy

| Field Category | Null Policy | Default Action |
|----------------|-------------|----------------|
| Identifiers | Reject record | Fail validation |
| Odds values | Accept with flag | Store as NULL, exclude from predictions |
| Statistics | Accept with flag | Use historical average or exclude |
| Timestamps | Reject record | Fail validation |
| Weather | Accept with flag | Use historical average |

### 3.5 Anomaly Detection

**Statistical Anomaly Rules**:
- Z-score > 3 for numeric fields flagged
- Odds movement > 3 points in < 5 minutes flagged
- Score changes > 20 points single update flagged
- Missing data > 10% of expected records flagged

---

## 4. ETL/ELT Workflows

### 4.1 Pipeline Architecture

**DAG Structure**:
```
                    ┌─────────────────┐
                    │  Data Sources   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │  Odds   │    │  Games  │    │  Stats  │
        │ Ingress │    │ Ingress │    │ Ingress │
        └────┬────┘    └────┬────┘    └────┬────┘
             │              │              │
             ▼              ▼              ▼
        ┌─────────────────────────────────────┐
        │           RAW DATA LAKE             │
        │    (Partitioned by source/date)     │
        └─────────────────┬───────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │        VALIDATION LAYER             │
        │   (Schema, Range, Consistency)      │
        └─────────────────┬───────────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │ Staging │ │ Staging │ │ Staging │
        │  Odds   │ │  Games  │ │  Stats  │
        └────┬────┘ └────┬────┘ └────┬────┘
             │           │           │
             └───────────┼───────────┘
                         │
                         ▼
        ┌─────────────────────────────────────┐
        │         CURATED DATASETS            │
        │   (Normalized, Deduplicated)        │
        └─────────────────┬───────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │          FEATURE STORE              │
        │    (ML-ready feature vectors)       │
        └─────────────────────────────────────┘
```

### 4.2 Raw Data Landing Zone

**Structure**:
- Partitioned by: source → sport → date → hour
- Format: JSON (compressed)
- Retention: 90 days in hot storage, 7 years in cold storage
- Naming Convention: `{source}/{sport}/{YYYY-MM-DD}/{HH}/{timestamp}_{uuid}.json.gz`

**Example Paths**:
- `raw/theoddsapi/nfl/2026-01-02/14/1704207600_abc123.json.gz`
- `raw/espn/nba/2026-01-02/18/1704222000_def456.json.gz`

### 4.3 Staging Layer

**Purpose**: Validated, typed data ready for transformation

**Processing Steps**:
1. Schema validation against defined contracts
2. Type casting and normalization
3. Deduplication based on natural keys
4. Null handling and default application
5. Quality score assignment

**Output Format**: Parquet with schema enforcement

### 4.4 Curated Datasets

**Master Tables**:

| Table | Description | Update Frequency |
|-------|-------------|------------------|
| dim_sports | Sport dimension with configurations | On change |
| dim_teams | Team dimension with attributes | Daily |
| dim_players | Player dimension with attributes | Daily |
| dim_venues | Venue dimension with attributes | On change |
| dim_sportsbooks | Sportsbook dimension | On change |
| fact_games | Game fact table with outcomes | Real-time |
| fact_odds | Odds fact table with snapshots | Real-time |
| fact_predictions | Prediction fact table | Real-time |
| fact_performance | Model performance metrics | Daily |

### 4.5 Historical Backfill Strategy

**Requirements by Sport**:

| Sport | Required History | Seasons | Exclusions |
|-------|-----------------|---------|------------|
| NFL | 10 years | 2015-2025 | 2020 COVID season |
| NBA | 10 years | 2015-2025 | 2020 COVID bubble |
| MLB | 10 years | 2015-2025 | 2020 shortened season |
| NHL | 10 years | 2015-2025 | 2020 COVID bubble |
| NCAAF | 8 years | 2017-2025 | 2020 COVID season |
| NCAAB | 8 years | 2017-2025 | 2020 cancelled tournament |
| CFL | 5 years | 2019-2025 | 2020 cancelled season |
| WNBA | 5 years | 2020-2025 | 2020 bubble included |
| ATP | 5 years | 2020-2025 | N/A |
| WTA | 5 years | 2020-2025 | N/A |

**Backfill Process**:
1. Identify data gaps through completeness audit
2. Source historical data from archives or providers
3. Apply same validation pipeline as live data
4. Mark records with `is_backfill = true` flag
5. Verify feature calculations match expectations
6. Update model training windows to include backfilled data

### 4.6 Incremental Update Strategy

**Change Data Capture (CDC) Patterns**:

| Data Type | CDC Method | Key Fields |
|-----------|-----------|------------|
| Odds | Timestamp comparison | game_id, sportsbook_id, recorded_at |
| Games | Status change tracking | game_id, status |
| Scores | Value comparison | game_id, home_score, away_score |
| Stats | Timestamp + hash | entity_id, stat_type, period |

**Update Frequency**:
- Real-time: Odds, live scores
- Near real-time (5 min): Game schedules, injuries
- Hourly: Team/player statistics
- Daily: Historical aggregations, feature recalculations

---

## 5. Pipeline Orchestration

### 5.1 DAG Definitions

**Pipeline 1: Odds Collection Pipeline**
- **Schedule**: Every 60 seconds
- **Steps**:
  1. Poll TheOddsAPI for all active sports
  2. Validate response schema
  3. Store in raw data lake
  4. Apply transformations to staging
  5. Update odds fact table
  6. Trigger line movement detection
  7. Update prediction edge calculations

**Pipeline 2: Game Data Pipeline**
- **Schedule**: Every 5 minutes
- **Steps**:
  1. Poll ESPN for schedules and scores
  2. Validate and reconcile with existing data
  3. Update game fact table
  4. Trigger auto-grading for completed games
  5. Update team/player statistics

**Pipeline 3: Feature Engineering Pipeline**
- **Schedule**: Hourly + on-demand
- **Steps**:
  1. Fetch latest game and statistical data
  2. Calculate rolling averages and trends
  3. Update ELO ratings
  4. Generate travel and rest features
  5. Compute head-to-head statistics
  6. Store in feature store

**Pipeline 4: Prediction Pipeline**
- **Schedule**: On-demand + 30 minutes pre-game
- **Steps**:
  1. Retrieve features for upcoming games
  2. Load production models
  3. Generate probability predictions
  4. Apply probability calibration
  5. Calculate Kelly bet sizing
  6. Store predictions with SHA-256 lock-in
  7. Generate SHAP explanations

### 5.2 Error Handling and Recovery

**Retry Policy**:
| Error Type | Initial Delay | Max Retries | Backoff |
|------------|--------------|-------------|---------|
| Connection timeout | 5s | 5 | Exponential |
| Rate limit | 60s | 10 | Fixed |
| Schema validation | None | 0 | Fail |
| Partial failure | 10s | 3 | Linear |

**Dead Letter Queue**:
- Failed records stored for manual review
- Automatic alerting on DLQ threshold
- Reprocessing capability after fix

**Idempotency**:
- All pipelines support re-execution without duplicates
- Natural key + timestamp deduplication
- Transaction isolation for critical updates

### 5.3 Monitoring and Alerting

**Pipeline Health Metrics**:
| Metric | Warning Threshold | Critical Threshold |
|--------|------------------|-------------------|
| Pipeline latency | > 2x normal | > 5x normal |
| Records processed | < 80% expected | < 50% expected |
| Validation failures | > 5% | > 10% |
| Data freshness | > 5 minutes | > 15 minutes |

**Alerting Channels**: Email, Slack, PagerDuty (critical only)

---

## 6. Data Quality Rules

### 6.1 Completeness Rules

| Rule ID | Description | Threshold | Action |
|---------|-------------|-----------|--------|
| DQ001 | Odds coverage for active games | > 90% | Warn |
| DQ002 | Games with complete features | > 95% | Warn |
| DQ003 | Players with current stats | > 85% | Warn |
| DQ004 | Closing lines captured | > 99% | Alert |
| DQ005 | Predictions generated pre-game | 100% | Alert |

### 6.2 Accuracy Rules

| Rule ID | Description | Validation | Action |
|---------|-------------|------------|--------|
| DQ101 | Odds within valid range | Range check | Reject |
| DQ102 | Scores non-negative | Value check | Reject |
| DQ103 | Team IDs valid | Reference check | Reject |
| DQ104 | Timestamps in valid range | Temporal check | Reject |
| DQ105 | Cross-source score match | Consistency check | Alert |

### 6.3 Freshness Rules

| Rule ID | Data Type | Max Age | Action |
|---------|-----------|---------|--------|
| DQ201 | Live odds | 2 minutes | Alert |
| DQ202 | Game schedules | 10 minutes | Warn |
| DQ203 | Live scores | 5 minutes | Alert |
| DQ204 | Injuries | 2 hours | Warn |
| DQ205 | Features | 1 hour pre-game | Alert |

---

*End of Data Pipelines Document*
