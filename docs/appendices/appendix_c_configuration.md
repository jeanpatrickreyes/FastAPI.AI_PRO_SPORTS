# Appendix C: Configuration Reference

## Environment Variables

### Application Core

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `APP_NAME` | string | "AI PRO SPORTS" | Application name |
| `APP_VERSION` | string | "2.0.0" | Current version |
| `ENVIRONMENT` | string | "development" | Environment (development/staging/production) |
| `DEBUG` | boolean | false | Enable debug mode |
| `LOG_LEVEL` | string | "INFO" | Logging level (DEBUG/INFO/WARNING/ERROR) |
| `SECRET_KEY` | string | **required** | Application secret for encryption |
| `HOST` | string | "0.0.0.0" | API server host |
| `PORT` | integer | 8000 | API server port |
| `WORKERS` | integer | 4 | Uvicorn worker count |

### Database Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DATABASE_URL` | string | **required** | PostgreSQL connection string |
| `DATABASE_POOL_SIZE` | integer | 20 | Connection pool size |
| `DATABASE_MAX_OVERFLOW` | integer | 10 | Max overflow connections |
| `DATABASE_POOL_TIMEOUT` | integer | 30 | Pool checkout timeout (seconds) |
| `DATABASE_POOL_RECYCLE` | integer | 3600 | Connection recycle time (seconds) |
| `DATABASE_ECHO` | boolean | false | Log SQL queries |

### Redis Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `REDIS_URL` | string | "redis://localhost:6379/0" | Redis connection string |
| `REDIS_MAX_CONNECTIONS` | integer | 50 | Maximum connections |
| `CACHE_TTL_DEFAULT` | integer | 300 | Default cache TTL (seconds) |
| `CACHE_TTL_ODDS` | integer | 30 | Odds cache TTL (seconds) |
| `CACHE_TTL_PREDICTIONS` | integer | 300 | Predictions cache TTL (seconds) |
| `CACHE_TTL_GAMES` | integer | 3600 | Games cache TTL (seconds) |

### External API Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ODDS_API_KEY` | string | **required** | TheOddsAPI key |
| `ODDS_API_BASE_URL` | string | "https://api.the-odds-api.com/v4" | TheOddsAPI base URL |
| `ODDS_API_TIMEOUT` | integer | 30 | Request timeout (seconds) |
| `ESPN_API_BASE_URL` | string | "https://site.api.espn.com/apis/site/v2/sports" | ESPN API base URL |
| `ESPN_API_TIMEOUT` | integer | 30 | Request timeout (seconds) |
| `WEATHER_API_KEY` | string | optional | Weather API key |
| `WEATHER_API_BASE_URL` | string | "https://api.openweathermap.org/data/2.5" | Weather API base URL |

### ML Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `H2O_MAX_MEM_SIZE` | string | "32g" | H2O maximum memory |
| `H2O_MAX_MODELS` | integer | 50 | Maximum models per AutoML run |
| `H2O_MAX_RUNTIME_SECS` | integer | 3600 | Maximum training runtime |
| `H2O_NFOLDS` | integer | 5 | Cross-validation folds |
| `AUTOGLUON_PRESET` | string | "best_quality" | AutoGluon training preset |
| `AUTOGLUON_TIME_LIMIT` | integer | 3600 | Training time limit (seconds) |
| `MODEL_PATH` | string | "/app/models" | Model storage path |
| `TRAINING_WINDOW_DAYS` | integer | 365 | Training data window |
| `VALIDATION_WINDOW_DAYS` | integer | 30 | Validation window |

### Betting Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `KELLY_FRACTION` | float | 0.25 | Fractional Kelly multiplier |
| `MAX_BET_PERCENT` | float | 0.02 | Maximum bet as percentage of bankroll |
| `MIN_EDGE_THRESHOLD` | float | 0.03 | Minimum edge to recommend bet |
| `DEFAULT_BANKROLL` | float | 10000.0 | Default starting bankroll |

### Signal Tier Thresholds

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SIGNAL_TIER_A_MIN` | float | 0.65 | Minimum probability for Tier A |
| `SIGNAL_TIER_B_MIN` | float | 0.60 | Minimum probability for Tier B |
| `SIGNAL_TIER_C_MIN` | float | 0.55 | Minimum probability for Tier C |

### Security Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `JWT_SECRET_KEY` | string | **required** | JWT signing key |
| `JWT_ALGORITHM` | string | "HS256" | JWT algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | integer | 15 | Access token expiry |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | integer | 7 | Refresh token expiry |
| `BCRYPT_ROUNDS` | integer | 12 | Password hashing rounds |
| `ENCRYPTION_KEY` | string | **required** | AES-256 encryption key |
| `CORS_ORIGINS` | string | "*" | Allowed CORS origins |
| `RATE_LIMIT_PER_MINUTE` | integer | 100 | API rate limit |

### Alerting Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | string | optional | Telegram bot token |
| `TELEGRAM_CHAT_ID` | string | optional | Telegram chat ID |
| `SLACK_WEBHOOK_URL` | string | optional | Slack webhook URL |
| `SMTP_HOST` | string | optional | Email SMTP host |
| `SMTP_PORT` | integer | 587 | Email SMTP port |
| `SMTP_USER` | string | optional | Email SMTP username |
| `SMTP_PASSWORD` | string | optional | Email SMTP password |
| `ALERT_EMAIL_FROM` | string | optional | Alert sender email |
| `ALERT_EMAIL_TO` | string | optional | Alert recipient email |

### Monitoring Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PROMETHEUS_PORT` | integer | 9090 | Prometheus metrics port |
| `GRAFANA_PORT` | integer | 3000 | Grafana dashboard port |
| `ENABLE_METRICS` | boolean | true | Enable metrics collection |
| `METRICS_PATH` | string | "/metrics" | Prometheus metrics endpoint |
| `HEALTH_CHECK_INTERVAL` | integer | 30 | Health check interval (seconds) |

## Configuration Files

### Sports Configuration

Each sport has a configuration entry defining:

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Sport identifier (NFL, NBA, etc.) |
| `name` | string | Display name |
| `odds_api_key` | string | TheOddsAPI sport key |
| `espn_sport` | string | ESPN sport identifier |
| `espn_league` | string | ESPN league identifier |
| `feature_count` | integer | Number of features for ML |
| `prediction_types` | array | Supported prediction types |
| `season_start` | string | Typical season start (MM-DD) |
| `season_end` | string | Typical season end (MM-DD) |
| `historical_years` | integer | Years of historical data required |
| `k_factor` | float | ELO K-factor |
| `home_advantage` | float | Default home advantage ELO adjustment |

### Sportsbook Configuration

Each sportsbook has a configuration entry:

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | TheOddsAPI sportsbook key |
| `name` | string | Display name |
| `is_sharp` | boolean | Sharp book indicator |
| `priority` | integer | Priority for best odds (lower = higher) |
| `markets` | array | Supported markets |
| `regions` | array | Available regions |

### Feature Configuration

Each feature type has configuration:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Feature name |
| `category` | string | Feature category |
| `calculation` | string | Calculation description |
| `update_frequency` | string | How often updated |
| `sports` | array | Applicable sports |
| `importance` | string | Typical importance (high/medium/low) |

## Default Values by Environment

### Development

| Setting | Value |
|---------|-------|
| DEBUG | true |
| LOG_LEVEL | DEBUG |
| DATABASE_POOL_SIZE | 5 |
| CACHE_TTL_DEFAULT | 60 |
| RATE_LIMIT_PER_MINUTE | 1000 |
| WORKERS | 1 |

### Staging

| Setting | Value |
|---------|-------|
| DEBUG | false |
| LOG_LEVEL | INFO |
| DATABASE_POOL_SIZE | 10 |
| CACHE_TTL_DEFAULT | 180 |
| RATE_LIMIT_PER_MINUTE | 100 |
| WORKERS | 2 |

### Production

| Setting | Value |
|---------|-------|
| DEBUG | false |
| LOG_LEVEL | WARNING |
| DATABASE_POOL_SIZE | 20 |
| CACHE_TTL_DEFAULT | 300 |
| RATE_LIMIT_PER_MINUTE | 100 |
| WORKERS | 4 |

## Feature Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `ENABLE_PLAYER_PROPS` | boolean | true | Enable player props predictions |
| `ENABLE_LIVE_BETTING` | boolean | false | Enable live/in-play features |
| `ENABLE_AUTOGLUON` | boolean | true | Enable AutoGluon in meta-ensemble |
| `ENABLE_2FA` | boolean | true | Enable two-factor authentication |
| `ENABLE_EMAIL_ALERTS` | boolean | true | Enable email alerting |
| `ENABLE_TELEGRAM_ALERTS` | boolean | true | Enable Telegram alerting |
| `ENABLE_SLACK_ALERTS` | boolean | true | Enable Slack alerting |
| `ENABLE_DETAILED_SHAP` | boolean | true | Enable detailed SHAP explanations |
| `ENABLE_BACKTESTING_API` | boolean | true | Enable backtesting API endpoints |
| `ENABLE_MODEL_COMPARISON` | boolean | true | Enable model comparison features |

## Scheduled Task Configuration

| Task | Schedule | Description |
|------|----------|-------------|
| `collect_odds` | Every 60 seconds | Fetch current odds from TheOddsAPI |
| `collect_games` | Every 5 minutes | Fetch game schedules from ESPN |
| `collect_scores` | Every 15 minutes | Fetch game scores during active periods |
| `generate_predictions` | Every 30 minutes | Generate new predictions |
| `grade_predictions` | Every 15 minutes | Grade completed predictions |
| `update_features` | Every hour | Recalculate team features |
| `daily_report` | Daily at 6:00 AM | Generate daily performance report |
| `weekly_retrain` | Weekly on Sunday 2:00 AM | Full model retraining |
| `backup_database` | Daily at 3:00 AM | Database backup |
| `cleanup_old_data` | Weekly on Sunday 4:00 AM | Archive old data |
| `health_check` | Every 30 seconds | System health verification |

## Threshold Configuration

### Data Quality Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Odds staleness | >2 minutes | >5 minutes |
| Missing games | >5% | >10% |
| Feature completeness | <95% | <90% |
| Anomaly rate | >1% | >5% |

### Model Performance Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Accuracy drop | >5% | >10% |
| AUC drop | >0.05 | >0.10 |
| Calibration error | >0.05 | >0.10 |
| Feature drift (PSI) | >0.10 | >0.25 |

### System Health Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| CPU usage | >70% | >90% |
| Memory usage | >75% | >90% |
| Disk usage | >70% | >85% |
| API latency p95 | >500ms | >1000ms |
| Error rate | >1% | >5% |
| Queue depth | >100 | >500 |
