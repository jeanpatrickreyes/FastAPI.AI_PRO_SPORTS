# 07 - QUICK REFERENCE CARD

## AI PRO SPORTS - One-Page Cheat Sheet

---

## SYSTEM OVERVIEW

| Metric | Value |
|--------|-------|
| **Sports** | 10 (NFL, NBA, MLB, NHL, NCAAF, NCAAB, CFL, WNBA, ATP, WTA) |
| **Features** | 1,212 total |
| **Database Tables** | 43 |
| **API Endpoints** | 146 |
| **Enterprise Rating** | 94/100 |

---

## SIGNAL TIERS

| Tier | Confidence | Target Accuracy | Action |
|------|------------|-----------------|--------|
| **A** | ≥65% | 65%+ | Maximum bet |
| **B** | 60-64% | 60-65% | Standard bet |
| **C** | 55-59% | 55-60% | Reduced bet |
| **D** | <55% | Track only | No bet |

---

## KELLY CRITERION

```
Bet Size = Bankroll × [(p × b - q) / b] × 0.25

p = win probability
q = 1 - p
b = decimal odds - 1
0.25 = fractional Kelly (25%)
```

**Limits:** Max bet = 2% of bankroll | Min edge = 3%

---

## KEY FORMULAS

### ELO Rating Update
```
New_ELO = Old_ELO + K × (Actual - Expected)
K-factor: NFL=32, NBA=20, MLB=8, NHL=16, Tennis=40
```

### CLV (Closing Line Value)
```
CLV = (Bet_Implied_Prob - Closing_Implied_Prob) / Closing_Implied_Prob × 100
Target: +1% to +3% = Professional grade
```

### Expected Value
```
EV = (Probability × Potential_Win) - ((1 - Probability) × Stake)
Bet only when EV > 0 and edge > 3%
```

---

## CLI COMMANDS

```bash
# Data Collection
python -m app.cli.admin data collect-odds -s NBA
python -m app.cli.admin data collect-games -s NBA

# Predictions
python -m app.cli.admin predict generate -s NBA
python -m app.cli.admin predict grade
python -m app.cli.admin predict stats -s NBA --days 7

# Models
python -m app.cli.admin model train -s NBA -b spread
python -m app.cli.admin model list
python -m app.cli.admin model promote MODEL_ID

# System
python -m app.cli.admin system status
python -m app.cli.admin system health
python -m app.cli.admin db init
```

---

## API ENDPOINTS

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System health |
| `/auth/login` | POST | User login |
| `/predictions` | GET | All predictions |
| `/predictions/today` | GET | Today's picks |
| `/predictions/sport/{code}` | GET | By sport |
| `/games` | GET | Game list |
| `/odds/{game_id}` | GET | Game odds |
| `/betting/bankroll` | GET | Bankroll info |
| `/betting/sizing` | POST | Get bet size |

**Base URL:** `https://api.yourdomain.com/api/v1`

---

## DOCKER COMMANDS

```bash
# Start/Stop
docker-compose up -d              # Start all
docker-compose down               # Stop all
docker-compose restart api        # Restart service

# Logs
docker-compose logs -f api        # Follow API logs
docker-compose logs --tail 100    # Last 100 lines

# Maintenance
docker-compose exec api bash      # Shell access
docker-compose exec postgres psql -U postgres  # DB access
docker-compose exec redis redis-cli  # Redis CLI
```

---

## ENVIRONMENT VARIABLES

```env
# Critical Settings
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=<64-char-key>
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379/0
ODDS_API_KEY=<your-key>

# Betting
KELLY_FRACTION=0.25
MAX_BET_PERCENT=0.02
MIN_EDGE_THRESHOLD=0.03

# Signal Tiers
SIGNAL_TIER_A_MIN=0.65
SIGNAL_TIER_B_MIN=0.60
SIGNAL_TIER_C_MIN=0.55
```

---

## ML META-ENSEMBLE WEIGHTS

| Framework | Weight | Use Case |
|-----------|--------|----------|
| H2O AutoML | 35% | Production inference |
| AutoGluon | 45% | Maximum accuracy |
| Sklearn | 20% | Stability/fallback |

---

## DATA REFRESH SCHEDULE

| Data Type | Interval |
|-----------|----------|
| Live Odds | 60 seconds |
| Game Schedules | 5 minutes |
| Scores | 15 minutes |
| Predictions | 30 minutes |
| Model Retrain | Weekly (Sunday 2 AM) |

---

## ALERT SEVERITY

| Level | Response Time | Channel |
|-------|---------------|---------|
| SEV1 | 5 minutes | PagerDuty + All |
| SEV2 | 15 minutes | Slack + Email |
| SEV3 | 1 hour | Slack |
| SEV4 | 24 hours | Email |

---

## TROUBLESHOOTING

| Issue | Quick Fix |
|-------|-----------|
| API not responding | `docker-compose restart api` |
| Database connection | Check DATABASE_URL, restart postgres |
| No predictions | Verify odds collected, check model status |
| High latency | Check CPU/RAM, scale workers |
| Stale odds | Verify ODDS_API_KEY, check rate limits |

---

## KEY PORTS

| Service | Port |
|---------|------|
| API | 8000 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Grafana | 3000 |
| Prometheus | 9090 |

---

## CONTACT & SUPPORT

| Resource | Location |
|----------|----------|
| Documentation | `/docs/` folder |
| API Docs | `https://api.domain.com/docs` |
| Grafana | `https://grafana.domain.com` |
| Logs | `docker-compose logs` |

---

**Version 2.0 | January 2026 | Enterprise Rating: 94/100**
