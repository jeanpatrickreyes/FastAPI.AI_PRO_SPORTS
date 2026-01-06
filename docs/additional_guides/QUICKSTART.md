# AI PRO SPORTS - QUICKSTART GUIDE

## Get Running in 5 Minutes

---

## Prerequisites

Before starting, ensure you have:
- Docker & Docker Compose installed
- Git installed
- 16GB RAM minimum
- API keys ready (TheOddsAPI, PostgreSQL credentials)

---

## Step 1: Clone Repository (30 seconds)

```bash
git clone https://github.com/your-org/ai-pro-sports.git
cd ai-pro-sports
```

---

## Step 2: Configure Environment (1 minute)

```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys
nano .env
```

**Minimum Required Variables:**
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/ai_pro_sports
REDIS_URL=redis://localhost:6379/0
ODDS_API_KEY=your-odds-api-key-here
SECRET_KEY=your-secret-key-minimum-32-characters
```

---

## Step 3: Start Services (2 minutes)

```bash
# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps
```

**Expected Output:**
```
NAME                STATUS
ai-pro-sports-api   Up (healthy)
ai-pro-sports-db    Up (healthy)
ai-pro-sports-redis Up (healthy)
```

---

## Step 4: Initialize Database (30 seconds)

```bash
# Run database migrations
docker-compose exec api python -m app.cli.admin db init

# Seed initial data (sports, teams)
docker-compose exec api python -m app.cli.admin db seed
```

---

## Step 5: Verify Installation (1 minute)

```bash
# Check API health
curl http://localhost:8000/api/v1/health

# Expected response:
# {"status": "healthy", "version": "2.0.0"}
```

**Access Points:**
| Service | URL |
|---------|-----|
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Grafana | http://localhost:3000 |

---

## Quick Commands Reference

| Action | Command |
|--------|---------|
| Start services | `docker-compose up -d` |
| Stop services | `docker-compose down` |
| View logs | `docker-compose logs -f api` |
| Collect odds | `docker-compose exec api python -m app.cli.admin data collect-odds` |
| Generate predictions | `docker-compose exec api python -m app.cli.admin predict generate` |
| Check system status | `docker-compose exec api python -m app.cli.admin system status` |

---

## First Predictions

```bash
# Collect today's odds
docker-compose exec api python -m app.cli.admin data collect-odds -s NBA

# Generate predictions
docker-compose exec api python -m app.cli.admin predict generate -s NBA

# View predictions
curl http://localhost:8000/api/v1/predictions/today
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Check DATABASE_URL in .env |
| Redis connection failed | Ensure Redis container is running |
| No odds data | Verify ODDS_API_KEY is valid |
| API not responding | Check `docker-compose logs api` |

---

## Next Steps

1. **Full Setup:** See `05_SETUP_GUIDE.md`
2. **Deployment:** See `BEGINNER_DEPLOYMENT_GUIDE.md`
3. **Configuration:** See `15_ENVIRONMENT_VARIABLES.md`
4. **API Integration:** See `13_API_INTEGRATION_GUIDE.md`

---

**You're now running AI PRO SPORTS!**

For support: Check the troubleshooting guide or review system logs.
