# Data Model and Database Schemas

## AI PRO SPORTS - Complete Database Specification

**Version 3.0 | January 2026**

---

## Overview

AI PRO SPORTS uses PostgreSQL 15+ as the primary OLTP database with 55 tables organized into logical domains. This document provides complete schema definitions for all tables.

---

## 1. Database Configuration

### Connection Settings
- **Host**: PostgreSQL server
- **Port**: 5432
- **Database**: ai_pro_sports
- **Connection Pool**: 20 connections (default)
- **SSL**: Required in production

### Naming Conventions
- Tables: lowercase with underscores (snake_case)
- Primary keys: `id` (UUID)
- Foreign keys: `{table}_id`
- Timestamps: `created_at`, `updated_at`
- Booleans: `is_` prefix

---

## 2. Users and Authentication Domain (5 tables)

### users
User accounts with roles and permissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| hashed_password | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| name | VARCHAR(100) | | Display name |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'user' | user, pro_user, admin, super_admin |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |
| two_factor_enabled | BOOLEAN | DEFAULT FALSE | 2FA enabled |
| two_factor_secret | VARCHAR(255) | | Encrypted TOTP secret |
| created_at | TIMESTAMP | NOT NULL | Account creation |
| updated_at | TIMESTAMP | | Last update |
| last_login_at | TIMESTAMP | | Last login time |

**Indexes:**
- `idx_users_email` on (email)
- `idx_users_role` on (role)

### sessions
Active user sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Session ID |
| user_id | UUID | FK → users | User reference |
| token_hash | VARCHAR(255) | NOT NULL | Hashed refresh token |
| expires_at | TIMESTAMP | NOT NULL | Session expiry |
| ip_address | INET | | Client IP |
| user_agent | TEXT | | Browser/client info |
| created_at | TIMESTAMP | NOT NULL | Session start |

### api_keys
API access tokens for programmatic access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Key ID |
| user_id | UUID | FK → users | Owner |
| key_hash | VARCHAR(255) | NOT NULL | Hashed API key |
| name | VARCHAR(100) | | Key name/label |
| permissions | JSONB | | Allowed endpoints |
| rate_limit | INTEGER | DEFAULT 100 | Requests per minute |
| is_active | BOOLEAN | DEFAULT TRUE | Key active |
| last_used_at | TIMESTAMP | | Last usage |
| created_at | TIMESTAMP | NOT NULL | Creation time |

### user_preferences
User settings and preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Preference ID |
| user_id | UUID | FK → users, UNIQUE | User reference |
| notification_settings | JSONB | | Alert preferences |
| display_preferences | JSONB | | UI settings |
| timezone | VARCHAR(50) | DEFAULT 'America/New_York' | User timezone |
| created_at | TIMESTAMP | NOT NULL | Creation |
| updated_at | TIMESTAMP | | Last update |

### audit_logs
Security audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Log ID |
| user_id | UUID | FK → users | Acting user |
| action | VARCHAR(50) | NOT NULL | Action performed |
| resource | VARCHAR(100) | | Resource affected |
| resource_id | VARCHAR(100) | | Resource ID |
| ip_address | INET | | Client IP |
| user_agent | TEXT | | Client info |
| details | JSONB | | Additional details |
| created_at | TIMESTAMP | NOT NULL | Event time |

**Indexes:**
- `idx_audit_logs_user_id` on (user_id)
- `idx_audit_logs_action` on (action)
- `idx_audit_logs_created_at` on (created_at)

---

## 3. Sports Data Domain (8 tables)

### sports
Sport configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Sport ID |
| code | VARCHAR(10) | UNIQUE, NOT NULL | NFL, NBA, etc. |
| name | VARCHAR(100) | NOT NULL | Full name |
| api_key | VARCHAR(50) | | External API key |
| is_active | BOOLEAN | DEFAULT TRUE | Sport enabled |
| feature_count | INTEGER | | Number of features |
| default_model_id | UUID | FK → ml_models | Default model |
| config | JSONB | | Sport-specific config |
| created_at | TIMESTAMP | NOT NULL | Creation |

### teams
Team information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Team ID |
| sport_id | UUID | FK → sports | Sport reference |
| external_id | VARCHAR(50) | | External system ID |
| name | VARCHAR(100) | NOT NULL | Team name |
| abbreviation | VARCHAR(10) | NOT NULL | Short code |
| city | VARCHAR(100) | | City |
| elo_rating | FLOAT | DEFAULT 1500 | Current ELO |
| conference | VARCHAR(50) | | Conference/league |
| division | VARCHAR(50) | | Division |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | NOT NULL | Creation |
| updated_at | TIMESTAMP | | Last update |

**Indexes:**
- `idx_teams_sport_id` on (sport_id)
- `idx_teams_abbreviation` on (abbreviation)

### players
Player records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Player ID |
| team_id | UUID | FK → teams | Current team |
| external_id | VARCHAR(50) | | External system ID |
| name | VARCHAR(100) | NOT NULL | Full name |
| position | VARCHAR(20) | | Position |
| jersey_number | INTEGER | | Jersey number |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| birth_date | DATE | | Birth date |
| created_at | TIMESTAMP | NOT NULL | Creation |
| updated_at | TIMESTAMP | | Last update |

### venues
Stadium/arena data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Venue ID |
| name | VARCHAR(200) | NOT NULL | Venue name |
| city | VARCHAR(100) | | City |
| state | VARCHAR(50) | | State/province |
| country | VARCHAR(50) | | Country |
| capacity | INTEGER | | Seating capacity |
| surface_type | VARCHAR(50) | | Grass, turf, etc. |
| is_dome | BOOLEAN | DEFAULT FALSE | Indoor/dome |
| timezone | VARCHAR(50) | | Venue timezone |
| latitude | FLOAT | | GPS latitude |
| longitude | FLOAT | | GPS longitude |
| created_at | TIMESTAMP | NOT NULL | Creation |

### seasons
Season definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Season ID |
| sport_id | UUID | FK → sports | Sport reference |
| year | INTEGER | NOT NULL | Season year |
| name | VARCHAR(50) | | Season name |
| start_date | DATE | | Season start |
| end_date | DATE | | Season end |
| is_current | BOOLEAN | DEFAULT FALSE | Current season |
| created_at | TIMESTAMP | NOT NULL | Creation |

### games
Game/event records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Game ID |
| sport_id | UUID | FK → sports | Sport reference |
| season_id | UUID | FK → seasons | Season reference |
| external_id | VARCHAR(50) | UNIQUE | External system ID |
| home_team_id | UUID | FK → teams | Home team |
| away_team_id | UUID | FK → teams | Away team |
| venue_id | UUID | FK → venues | Venue reference |
| game_date | TIMESTAMP | NOT NULL | Game date/time |
| week | INTEGER | | Week number |
| status | VARCHAR(20) | DEFAULT 'scheduled' | scheduled, in_progress, final, postponed |
| home_score | INTEGER | | Home final score |
| away_score | INTEGER | | Away final score |
| overtime | BOOLEAN | DEFAULT FALSE | OT game |
| created_at | TIMESTAMP | NOT NULL | Creation |
| updated_at | TIMESTAMP | | Last update |

**Indexes:**
- `idx_games_sport_id` on (sport_id)
- `idx_games_game_date` on (game_date)
- `idx_games_status` on (status)
- `idx_games_teams` on (home_team_id, away_team_id)

### team_stats
Team statistics by season.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Stats ID |
| team_id | UUID | FK → teams | Team reference |
| season_id | UUID | FK → seasons | Season reference |
| stat_type | VARCHAR(50) | NOT NULL | Stat category |
| value | FLOAT | NOT NULL | Stat value |
| games_played | INTEGER | | Games in sample |
| created_at | TIMESTAMP | NOT NULL | Creation |
| updated_at | TIMESTAMP | | Last update |

### player_stats
Player statistics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Stats ID |
| player_id | UUID | FK → players | Player reference |
| season_id | UUID | FK → seasons | Season reference |
| stat_type | VARCHAR(50) | NOT NULL | Stat category |
| value | FLOAT | NOT NULL | Stat value |
| games_played | INTEGER | | Games in sample |
| created_at | TIMESTAMP | NOT NULL | Creation |
| updated_at | TIMESTAMP | | Last update |

---

## 4. Odds and Markets Domain (5 tables)

### sportsbooks
Bookmaker information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Sportsbook ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Display name |
| api_key | VARCHAR(50) | | TheOddsAPI key |
| is_sharp | BOOLEAN | DEFAULT FALSE | Sharp book flag |
| vig_estimate | FLOAT | | Estimated vig |
| is_active | BOOLEAN | DEFAULT TRUE | Active for collection |
| created_at | TIMESTAMP | NOT NULL | Creation |

### odds
Current and historical odds.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Odds ID |
| game_id | UUID | FK → games | Game reference |
| sportsbook_id | UUID | FK → sportsbooks | Sportsbook |
| market_type | VARCHAR(20) | NOT NULL | spread, moneyline, total |
| selection | VARCHAR(20) | NOT NULL | home, away, over, under |
| price | INTEGER | NOT NULL | American odds |
| line | FLOAT | | Point spread/total line |
| recorded_at | TIMESTAMP | NOT NULL | Collection time |
| is_current | BOOLEAN | DEFAULT TRUE | Current odds flag |

**Indexes:**
- `idx_odds_game_id` on (game_id)
- `idx_odds_recorded_at` on (recorded_at)
- `idx_odds_current` on (game_id, is_current) WHERE is_current = TRUE

### odds_movements
Line movement tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Movement ID |
| game_id | UUID | FK → games | Game reference |
| sportsbook_id | UUID | FK → sportsbooks | Sportsbook |
| market_type | VARCHAR(20) | NOT NULL | Market type |
| old_line | FLOAT | | Previous line |
| new_line | FLOAT | | New line |
| old_price | INTEGER | | Previous price |
| new_price | INTEGER | | New price |
| movement_size | FLOAT | | Movement magnitude |
| detected_at | TIMESTAMP | NOT NULL | Detection time |

### closing_lines
Final lines for CLV calculation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Record ID |
| game_id | UUID | FK → games | Game reference |
| sportsbook_id | UUID | FK → sportsbooks | Sportsbook |
| market_type | VARCHAR(20) | NOT NULL | Market type |
| selection | VARCHAR(20) | NOT NULL | Selection |
| closing_line | FLOAT | | Final line |
| closing_price | INTEGER | | Final price |
| closed_at | TIMESTAMP | NOT NULL | Closing time |

### consensus_lines
Market consensus lines.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Record ID |
| game_id | UUID | FK → games | Game reference |
| market_type | VARCHAR(20) | NOT NULL | Market type |
| consensus_line | FLOAT | | Consensus line |
| consensus_price | INTEGER | | Consensus price |
| books_count | INTEGER | | Books in calculation |
| calculated_at | TIMESTAMP | NOT NULL | Calculation time |

---

## 5. Predictions Domain (4 tables)

### predictions
All predictions with full details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Prediction ID |
| game_id | UUID | FK → games | Game reference |
| model_id | UUID | FK → ml_models | Model reference |
| bet_type | VARCHAR(20) | NOT NULL | spread, moneyline, total |
| predicted_side | VARCHAR(20) | NOT NULL | home, away, over, under |
| probability | FLOAT | NOT NULL | Calibrated probability |
| edge | FLOAT | | Edge over market |
| signal_tier | CHAR(1) | NOT NULL | A, B, C, D |
| kelly_fraction | FLOAT | | Kelly bet fraction |
| line_at_prediction | FLOAT | | Line when predicted |
| odds_at_prediction | INTEGER | | Odds when predicted |
| prediction_hash | VARCHAR(64) | UNIQUE | SHA-256 hash |
| created_at | TIMESTAMP | NOT NULL | Creation time |

**Indexes:**
- `idx_predictions_game_id` on (game_id)
- `idx_predictions_signal_tier` on (signal_tier)
- `idx_predictions_created_at` on (created_at)

### prediction_results
Graded prediction outcomes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Result ID |
| prediction_id | UUID | FK → predictions, UNIQUE | Prediction reference |
| actual_result | VARCHAR(10) | | win, loss, push |
| profit_loss | FLOAT | | P/L amount |
| clv | FLOAT | | Closing line value |
| closing_line | FLOAT | | Final line |
| graded_at | TIMESTAMP | NOT NULL | Grading time |

### player_props
Player prop predictions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Prop ID |
| game_id | UUID | FK → games | Game reference |
| player_id | UUID | FK → players | Player reference |
| prop_type | VARCHAR(50) | NOT NULL | points, rebounds, etc. |
| predicted_value | FLOAT | | Predicted stat value |
| over_probability | FLOAT | | Over probability |
| under_probability | FLOAT | | Under probability |
| line | FLOAT | | Prop line |
| signal_tier | CHAR(1) | | Tier classification |
| created_at | TIMESTAMP | NOT NULL | Creation time |

### shap_explanations
Feature contributions for predictions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Explanation ID |
| prediction_id | UUID | FK → predictions | Prediction reference |
| feature_name | VARCHAR(100) | NOT NULL | Feature name |
| feature_value | FLOAT | | Feature value |
| shap_value | FLOAT | NOT NULL | SHAP contribution |
| impact_direction | VARCHAR(10) | | positive, negative |
| rank | INTEGER | | Importance rank |

---

## 6. ML Models Domain (5 tables)

### ml_models
Model metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Model ID |
| sport_id | UUID | FK → sports | Sport reference |
| bet_type | VARCHAR(20) | NOT NULL | Bet type |
| framework | VARCHAR(20) | NOT NULL | h2o, autogluon, sklearn |
| version | VARCHAR(50) | NOT NULL | Version string |
| file_path | VARCHAR(500) | | Model artifact path |
| is_production | BOOLEAN | DEFAULT FALSE | Production flag |
| performance_metrics | JSONB | | Validation metrics |
| created_at | TIMESTAMP | NOT NULL | Creation time |

### training_runs
Training history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Run ID |
| model_id | UUID | FK → ml_models | Model reference |
| started_at | TIMESTAMP | NOT NULL | Start time |
| completed_at | TIMESTAMP | | End time |
| status | VARCHAR(20) | NOT NULL | running, completed, failed |
| hyperparameters | JSONB | | Training params |
| validation_metrics | JSONB | | Results |
| training_data_hash | VARCHAR(64) | | Data hash |
| error_message | TEXT | | Error if failed |

### model_performance
Performance tracking over time.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Record ID |
| model_id | UUID | FK → ml_models | Model reference |
| date | DATE | NOT NULL | Performance date |
| accuracy | FLOAT | | Overall accuracy |
| auc | FLOAT | | AUC-ROC |
| log_loss | FLOAT | | Log loss |
| brier_score | FLOAT | | Brier score |
| calibration_error | FLOAT | | ECE |
| predictions_count | INTEGER | | Number of predictions |

### feature_importance
Feature rankings by model.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Record ID |
| model_id | UUID | FK → ml_models | Model reference |
| feature_name | VARCHAR(100) | NOT NULL | Feature name |
| importance_score | FLOAT | NOT NULL | Importance value |
| importance_rank | INTEGER | | Rank |

### calibration_models
Probability calibrators.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Calibrator ID |
| model_id | UUID | FK → ml_models | Parent model |
| calibrator_type | VARCHAR(20) | NOT NULL | isotonic, platt |
| calibrator_path | VARCHAR(500) | | Artifact path |
| created_at | TIMESTAMP | NOT NULL | Creation time |

---

## 7. Betting Domain (3 tables)

### bankrolls
User bankroll tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Bankroll ID |
| user_id | UUID | FK → users, UNIQUE | User reference |
| initial_amount | DECIMAL(12,2) | NOT NULL | Starting balance |
| current_amount | DECIMAL(12,2) | NOT NULL | Current balance |
| peak_amount | DECIMAL(12,2) | | High watermark |
| low_amount | DECIMAL(12,2) | | Low watermark |
| currency | CHAR(3) | DEFAULT 'USD' | Currency code |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | | Last update |

### bets
Tracked bet records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Bet ID |
| user_id | UUID | FK → users | User reference |
| prediction_id | UUID | FK → predictions | Prediction reference |
| bankroll_id | UUID | FK → bankrolls | Bankroll reference |
| stake | DECIMAL(10,2) | NOT NULL | Bet amount |
| odds | INTEGER | NOT NULL | Odds at bet |
| bet_type | VARCHAR(20) | NOT NULL | Bet type |
| sportsbook | VARCHAR(100) | | Book used |
| placed_at | TIMESTAMP | NOT NULL | Bet placement |
| result | VARCHAR(10) | | win, loss, push, pending |
| profit_loss | DECIMAL(10,2) | | P/L amount |
| settled_at | TIMESTAMP | | Settlement time |

**Indexes:**
- `idx_bets_user_id` on (user_id)
- `idx_bets_placed_at` on (placed_at)
- `idx_bets_result` on (result)

### bankroll_transactions
Transaction history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Transaction ID |
| bankroll_id | UUID | FK → bankrolls | Bankroll reference |
| type | VARCHAR(20) | NOT NULL | deposit, withdrawal, bet, win |
| amount | DECIMAL(10,2) | NOT NULL | Transaction amount |
| balance_after | DECIMAL(12,2) | NOT NULL | Balance after |
| description | TEXT | | Notes |
| bet_id | UUID | FK → bets | Related bet |
| created_at | TIMESTAMP | NOT NULL | Transaction time |

---

## 8. System Domain (5 tables)

### system_settings
Global configuration settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Setting ID |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Setting key |
| value | TEXT | NOT NULL | Setting value |
| value_type | VARCHAR(20) | | string, int, float, bool, json |
| description | TEXT | | Setting description |
| updated_at | TIMESTAMP | | Last update |
| updated_by | UUID | FK → users | Last updater |

### scheduled_tasks
Background task scheduling.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Task ID |
| task_name | VARCHAR(100) | UNIQUE, NOT NULL | Task identifier |
| cron_expression | VARCHAR(50) | | Cron schedule |
| last_run | TIMESTAMP | | Last execution |
| next_run | TIMESTAMP | | Next scheduled |
| is_enabled | BOOLEAN | DEFAULT TRUE | Task enabled |
| status | VARCHAR(20) | | idle, running, failed |
| error_message | TEXT | | Last error |

### alerts
System alerts and notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Alert ID |
| alert_type | VARCHAR(50) | NOT NULL | Alert category |
| severity | VARCHAR(20) | NOT NULL | info, warning, critical |
| message | TEXT | NOT NULL | Alert message |
| details | JSONB | | Additional context |
| is_acknowledged | BOOLEAN | DEFAULT FALSE | Acknowledged flag |
| acknowledged_by | UUID | FK → users | Acknowledger |
| acknowledged_at | TIMESTAMP | | Acknowledgment time |
| created_at | TIMESTAMP | NOT NULL | Alert creation |

### data_quality_checks
Data quality audit logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Check ID |
| check_type | VARCHAR(50) | NOT NULL | Check category |
| source | VARCHAR(100) | NOT NULL | Data source |
| passed | BOOLEAN | NOT NULL | Check result |
| failed_count | INTEGER | DEFAULT 0 | Failed records |
| details | JSONB | | Check details |
| checked_at | TIMESTAMP | NOT NULL | Check time |

### system_health_snapshots
System health history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Snapshot ID |
| component | VARCHAR(50) | NOT NULL | Component name |
| status | VARCHAR(20) | NOT NULL | healthy, degraded, down |
| metrics | JSONB | | Health metrics |
| snapshot_at | TIMESTAMP | NOT NULL | Snapshot time |

---

## Table Summary

| Domain | Tables | Description |
|--------|--------|-------------|
| Users & Auth | 5 | User accounts, sessions, API keys, preferences, audit |
| Sports Data | 8 | Sports, teams, players, venues, seasons, games, stats |
| Odds & Markets | 5 | Sportsbooks, odds, movements, closing lines, consensus |
| Predictions | 4 | Predictions, results, player props, SHAP explanations |
| ML Models | 5 | Models, training runs, performance, features, calibration |
| Betting | 3 | Bankrolls, bets, transactions |
| System | 5 | Settings, tasks, alerts, data quality, health |
| **Total** | **35** | Core tables |

*Note: Additional tables for data warehouse (fact/dimension tables) and feature store bring total to 55 tables.*

---

**AI PRO SPORTS - Database Schema**

*Version 3.0 | January 2026*
