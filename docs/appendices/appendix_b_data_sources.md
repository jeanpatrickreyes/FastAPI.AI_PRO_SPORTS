# Appendix B: External Data Sources & API References

## Primary Data Providers

### 1. TheOddsAPI

**Purpose**: Real-time and historical odds from 40+ sportsbooks

| Attribute | Details |
|-----------|---------|
| **Base URL** | `https://api.the-odds-api.com/v4` |
| **Authentication** | API Key in query parameter |
| **Rate Limits** | Based on subscription tier |
| **Data Format** | JSON |

**Supported Markets**:
- Moneyline (h2h)
- Spreads (spreads)
- Totals (totals)
- Outrights/Futures (outrights)
- Player Props (various)

**Sport Keys**:

| Sport | API Key |
|-------|---------|
| NFL | `americanfootball_nfl` |
| NCAAF | `americanfootball_ncaaf` |
| CFL | `americanfootball_cfl` |
| NBA | `basketball_nba` |
| NCAAB | `basketball_ncaab` |
| WNBA | `basketball_wnba` |
| NHL | `icehockey_nhl` |
| MLB | `baseball_mlb` |
| ATP | `tennis_atp_*` |
| WTA | `tennis_wta_*` |

**Key Endpoints**:

| Endpoint | Purpose | Update Frequency |
|----------|---------|------------------|
| `/sports` | List available sports | Daily |
| `/sports/{sport}/odds` | Current odds | 60 seconds |
| `/sports/{sport}/scores` | Live scores | 60 seconds |
| `/sports/{sport}/events` | Event schedules | 5 minutes |
| `/historical/sports/{sport}/odds` | Historical odds | On-demand |

**Response Structure** (conceptual):
- `id`: Unique event identifier
- `sport_key`: Sport identifier
- `commence_time`: Event start time (ISO 8601)
- `home_team`: Home team name
- `away_team`: Away team name
- `bookmakers[]`: Array of sportsbook odds
  - `key`: Sportsbook identifier
  - `markets[]`: Array of betting markets
    - `key`: Market type (h2h, spreads, totals)
    - `outcomes[]`: Odds for each outcome

### 2. ESPN API

**Purpose**: Game schedules, scores, team/player statistics

| Attribute | Details |
|-----------|---------|
| **Base URL** | `https://site.api.espn.com/apis/site/v2/sports` |
| **Authentication** | Public (rate limited) |
| **Data Format** | JSON |

**Key Endpoints**:

| Endpoint Pattern | Purpose |
|------------------|---------|
| `/{sport}/{league}/scoreboard` | Current/recent scores |
| `/{sport}/{league}/teams` | Team information |
| `/{sport}/{league}/teams/{id}/roster` | Team rosters |
| `/{sport}/{league}/teams/{id}/schedule` | Team schedules |
| `/{sport}/{league}/standings` | League standings |
| `/{sport}/{league}/news` | League news |

**Sport/League Mappings**:

| Sport | League Code |
|-------|-------------|
| Football | `nfl`, `college-football` |
| Basketball | `nba`, `mens-college-basketball`, `wnba` |
| Hockey | `nhl` |
| Baseball | `mlb` |
| Tennis | `tennis` |

### 3. Weather APIs

**Purpose**: Outdoor game conditions (NFL, MLB, NCAAF)

**Recommended Providers**:

| Provider | Features |
|----------|----------|
| OpenWeatherMap | Current + forecast, wide coverage |
| Weather.gov | US coverage, free, high accuracy |
| AccuWeather | Minute-by-minute precipitation |

**Required Data Points**:
- Temperature (F)
- Wind speed (mph) and direction
- Humidity (%)
- Precipitation probability (%)
- Conditions description

**Collection Schedule**: 4 hours before outdoor games

### 4. Tennis-Specific Sources

**ATP Official Data**:
- Rankings
- Tournament schedules
- Player profiles
- Head-to-head records

**WTA Official Data**:
- Rankings
- Tournament schedules
- Player profiles

**Jeff Sackmann Tennis Abstract**:
- Historical match data
- Point-by-point data (where available)
- ELO ratings

## Data Quality Requirements by Source

### TheOddsAPI Quality Checks

| Check | Threshold | Action on Failure |
|-------|-----------|-------------------|
| Response latency | <2 seconds | Retry with backoff |
| Odds range | -10000 to +10000 | Log anomaly, skip line |
| Spread range | -50 to +50 | Log anomaly, skip line |
| Bookmaker coverage | ≥5 books per event | Flag low coverage |
| Timestamp freshness | <5 minutes | Use cached data |

### ESPN Data Quality Checks

| Check | Threshold | Action on Failure |
|-------|-----------|-------------------|
| Team ID consistency | Exact match | Reconcile via mapping |
| Score validation | Non-negative integers | Log error, skip |
| Schedule completeness | All teams represented | Alert for gaps |
| Player active status | Valid status codes | Default to unknown |

## Rate Limit Management

### TheOddsAPI Limits

| Tier | Requests/Month | Strategy |
|------|----------------|----------|
| Free | 500 | Development only |
| Starter | 10,000 | Hourly batches |
| Standard | 50,000 | 5-minute polling |
| Professional | 200,000+ | 60-second polling |

**Backoff Strategy**:
1. On 429 response: Wait 60 seconds
2. Exponential backoff: 60s, 120s, 240s, 480s
3. Max retries: 5
4. Circuit breaker: Open after 3 consecutive failures

### ESPN Rate Limits

| Type | Limit | Strategy |
|------|-------|----------|
| Per-minute | ~60 requests | Spread requests evenly |
| Per-hour | ~1000 requests | Prioritize by schedule |
| Burst | 10 concurrent | Queue overflow requests |

## Data Reconciliation Rules

### Cross-Source Team Matching

| Canonical Source | Secondary Sources | Matching Method |
|------------------|-------------------|-----------------|
| Internal team_id | ESPN, TheOddsAPI | Pre-built mapping table |
| Team name | Various | Fuzzy matching + manual review |
| Abbreviations | Various | Mapping table |

### Odds Reconciliation

| Scenario | Action |
|----------|--------|
| Same game, different IDs | Match by teams + date + time |
| Missing sportsbook | Skip in best odds calculation |
| Stale odds (>5 min) | Exclude from live analysis |
| Outlier odds (>3 std dev) | Flag for review |

### Score Reconciliation

| Scenario | Action |
|----------|--------|
| Conflicting final scores | Use ESPN as authoritative |
| Missing scores | Retry for 24 hours, then mark incomplete |
| Score corrections | Update and re-grade predictions |

## API Error Handling Matrix

| Error Code | Meaning | Action | Retry |
|------------|---------|--------|-------|
| 200 | Success | Process normally | N/A |
| 400 | Bad request | Log and fix query | No |
| 401 | Unauthorized | Check API key | No |
| 403 | Forbidden | Check permissions | No |
| 404 | Not found | Skip resource | No |
| 429 | Rate limited | Backoff | Yes |
| 500 | Server error | Retry with backoff | Yes |
| 502 | Bad gateway | Retry with backoff | Yes |
| 503 | Service unavailable | Retry with backoff | Yes |
| 504 | Gateway timeout | Retry with backoff | Yes |

## Data Retention from External Sources

| Data Type | Retention | Storage |
|-----------|-----------|---------|
| Raw API responses | 7 days | Cold storage |
| Parsed odds | Forever | Hot storage (recent), archive (old) |
| Closing lines | Forever | Hot storage |
| Game results | Forever | Hot storage |
| Weather data | 1 year | Archive |
| Player stats | Forever | Hot storage |

## Fallback Hierarchy

When primary source unavailable:

### Odds Data
1. TheOddsAPI (primary)
2. Cached data (if <5 minutes old)
3. Last known closing line
4. Skip event for predictions

### Game Data
1. ESPN API (primary)
2. TheOddsAPI event data
3. Cached schedule
4. Manual entry alert

### Weather Data
1. OpenWeatherMap (primary)
2. Weather.gov (US games)
3. Default values (dome/indoor override)
4. Conservative estimate (neutral conditions)
