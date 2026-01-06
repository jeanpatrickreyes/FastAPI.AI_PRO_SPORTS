# 22 - OPERATOR RULES ONE-PAGER

## AI PRO SPORTS - Daily Operations Quick Guide

---

## DAILY SCHEDULE

| Time (UTC) | Task | Command/Action |
|------------|------|----------------|
| 06:00 | Review overnight alerts | Check Telegram/Slack |
| 06:15 | System health check | `system status` |
| 06:30 | Verify data collection | Check odds freshness |
| 08:00 | Morning predictions review | Dashboard check |
| 12:00 | Midday health check | API + DB status |
| 18:00 | Pre-game verification | All predictions delivered |
| 22:00 | Grade completed games | Auto-grading status |
| 23:00 | Daily report review | Performance summary |

---

## QUICK HEALTH CHECK

```bash
# Full system status
docker-compose exec api python -m app.cli.admin system status

# Quick health
curl http://localhost:8000/api/v1/health

# Service status
docker-compose ps
```

**Healthy Response:**
```json
{"status": "healthy", "database": "ok", "redis": "ok", "ml_models": "loaded"}
```

---

## SIGNAL TIER RULES

| Tier | Confidence | Bet Action | Max Stake |
|------|------------|------------|-----------|
| **A** | ≥65% | **MAXIMUM BET** | 2% bankroll |
| **B** | 60-64% | Standard bet | 1.5% bankroll |
| **C** | 55-59% | Reduced bet | 0.5% bankroll |
| **D** | <55% | **NO BET** | Track only |

### Tier A Handling
- Immediate notification required
- Document bet placement time
- Track closing line for CLV

### Tier D Handling
- NEVER place bets
- Use for analysis only
- Review if pattern emerges

---

## ALERT RESPONSE MATRIX

| Alert | Severity | Response Time | Action |
|-------|----------|---------------|--------|
| 🔴 System Down | SEV1 | 5 minutes | Page on-call, escalate |
| 🟠 Data Feed Failure | SEV2 | 15 minutes | Check API, restart collector |
| 🟡 Model Degradation | SEV3 | 1 hour | Review, flag for ML team |
| 🔵 Performance Warning | SEV4 | 24 hours | Log, weekly review |

### SEV1 Response Procedure
1. Acknowledge alert immediately
2. Check service status: `docker-compose ps`
3. Review logs: `docker-compose logs --tail 100`
4. Restart if needed: `docker-compose restart`
5. Escalate if unresolved after 15 min

---

## DATA FRESHNESS RULES

| Data Type | Max Age | Check Command |
|-----------|---------|---------------|
| Odds | 2 minutes | `SELECT MAX(recorded_at) FROM odds` |
| Games | 15 minutes | Dashboard timestamp |
| Scores | 30 minutes | ESPN feed status |
| Predictions | 60 minutes | Last prediction time |

### Stale Data Action
```bash
# Force odds refresh
docker-compose exec api python -m app.cli.admin data collect-odds --force

# Check collector status
docker-compose logs --tail 50 worker | grep "odds"
```

---

## PREDICTION VERIFICATION

Before trusting any prediction:

1. ✅ Confidence level matches tier
2. ✅ Odds are current (< 5 min old)
3. ✅ Game hasn't started
4. ✅ No data quality alerts
5. ✅ Model is current version

### Red Flags - Do NOT Bet
- ⛔ Prediction older than 2 hours
- ⛔ Odds data > 5 minutes stale
- ⛔ Model accuracy dropped > 5%
- ⛔ System health not "healthy"
- ⛔ Multiple data quality alerts

---

## BANKROLL RULES

### Position Sizing
```
Bet Size = Bankroll × Kelly Fraction × 0.25

Kelly = (probability × odds - 1) / (odds - 1)
Max bet = 2% of bankroll (HARD CAP)
```

### Daily Limits
- **Max bets per day:** 20
- **Max exposure:** 10% of bankroll
- **Stop loss:** Pause at -5% daily
- **Review trigger:** 3 consecutive losses on Tier A

---

## COMMON ISSUES & FIXES

| Issue | Quick Fix |
|-------|-----------|
| API not responding | `docker-compose restart api` |
| No predictions showing | Check model status, verify odds collected |
| Stale odds | Verify ODDS_API_KEY, restart worker |
| High latency | Check CPU/RAM, restart services |
| Database connection | Check DATABASE_URL, restart postgres |
| Redis errors | `docker-compose restart redis` |

---

## ESCALATION PATH

```
Level 1: Operator (You)
   ↓ 15 min unresolved
Level 2: DevOps On-Call
   ↓ 30 min unresolved  
Level 3: Engineering Lead
   ↓ 1 hour unresolved
Level 4: VP Engineering
```

### Contact Info
- DevOps On-Call: Check PagerDuty
- Slack: #ai-pro-sports-ops
- Emergency: See runbook

---

## END-OF-DAY CHECKLIST

- [ ] All predictions graded
- [ ] Daily performance logged
- [ ] No unacknowledged alerts
- [ ] Backup completed
- [ ] Tomorrow's games loaded
- [ ] Model status verified

---

## KEY METRICS TO WATCH

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Tier A Accuracy | >65% | 60-65% | <60% |
| CLV | >+1.5% | 0-1.5% | <0% |
| API Latency | <100ms | 100-500ms | >500ms |
| Error Rate | <0.1% | 0.1-1% | >1% |
| Data Freshness | <1min | 1-5min | >5min |

---

## EMERGENCY COMMANDS

```bash
# Stop all betting (emergencies only)
docker-compose exec api python -m app.cli.admin system pause

# Full system restart
docker-compose down && docker-compose up -d

# Emergency backup
docker-compose exec postgres pg_dump -U postgres ai_pro_sports > emergency_backup.sql

# View recent errors
docker-compose logs --since 30m | grep -i error
```

---

## REMEMBER

1. **When in doubt, don't bet** - Skip uncertain situations
2. **Data quality = prediction quality** - Monitor freshness
3. **Tier A is gold** - Never miss, always verify
4. **CLV matters most** - Track every bet's closing line
5. **Escalate early** - Better safe than sorry

---

**Operator Guide v2.0 | January 2026**
