# BEGINNER DEPLOYMENT GUIDE

## AI PRO SPORTS - Simple Step-by-Step Deployment

---

## Who Is This Guide For?

This guide is for users who are new to deploying applications. It provides simplified, step-by-step instructions without technical jargon.

---

## What You'll Need

Before starting, make sure you have:

1. ✅ A server or cloud account (we recommend Hetzner)
2. ✅ Your API keys (TheOddsAPI, etc.)
3. ✅ Basic ability to copy/paste commands
4. ✅ About 2 hours of time

---

## Step 1: Get a Server

### Option A: Hetzner (Recommended)

1. Go to https://www.hetzner.com
2. Create an account
3. Click "Cloud" → "Add Server"
4. Choose:
   - Location: Closest to you
   - Image: Ubuntu 24.04
   - Type: CPX41 (for testing) or GEX131 (for production)
5. Add your SSH key (or they'll email you a password)
6. Click "Create & Buy Now"
7. Wait 2-3 minutes for server to be ready
8. Note your server's IP address (looks like: 123.45.67.89)

### Option B: DigitalOcean

1. Go to https://www.digitalocean.com
2. Create Droplet
3. Choose Ubuntu 24.04
4. Select size (8GB RAM minimum)
5. Create and note IP address

---

## Step 2: Connect to Your Server

### On Mac/Linux

Open Terminal and type:
```bash
ssh root@YOUR_SERVER_IP
```
Replace YOUR_SERVER_IP with your actual IP.

### On Windows

1. Download PuTTY from https://putty.org
2. Enter your server IP
3. Click "Open"
4. Login as "root"

**First Time?** Type "yes" when asked about fingerprint.

---

## Step 3: Prepare the Server

Copy and paste these commands one at a time:

```bash
# Update the system
apt update && apt upgrade -y
```

Wait for it to finish (may take 2-5 minutes).

```bash
# Install required software
apt install -y curl git
```

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

```bash
# Install Docker Compose
apt install docker-compose-plugin -y
```

**Verify Installation:**
```bash
docker --version
docker compose version
```

You should see version numbers (Docker 24+ and Compose 2+).

---

## Step 4: Download AI PRO SPORTS

```bash
# Create directory
mkdir -p /opt/ai-pro-sports
cd /opt/ai-pro-sports
```

```bash
# Download the application
git clone https://github.com/your-org/ai-pro-sports.git .
```

Or if you have a ZIP file:
```bash
# Upload your ZIP and extract
unzip ai-pro-sports.zip
```

---

## Step 5: Configure Settings

```bash
# Create your configuration file
cp .env.example .env
```

```bash
# Edit the configuration
nano .env
```

**Change these lines:** (use arrow keys to navigate)

```env
# Replace with real values
SECRET_KEY=change-this-to-something-random-and-long-at-least-32-characters

# Your database password (make it strong!)
DATABASE_PASSWORD=YourStrongPassword123!

# Your TheOddsAPI key
ODDS_API_KEY=your-real-api-key-from-theoddsapi

# Set to production
ENVIRONMENT=production
DEBUG=false
```

**To save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 6: Start the Application

```bash
# Start everything
docker compose up -d
```

Wait 2-3 minutes for all services to start.

```bash
# Check if everything is running
docker compose ps
```

**You should see something like:**
```
NAME                    STATUS
ai-pro-sports-api       Up (healthy)
ai-pro-sports-postgres  Up (healthy)
ai-pro-sports-redis     Up (healthy)
```

If you see "Up (healthy)" for all services, you're good!

---

## Step 7: Initialize the Database

```bash
# Set up database tables
docker compose exec api python -m app.cli.admin db init
```

```bash
# Add initial data
docker compose exec api python -m app.cli.admin db seed
```

---

## Step 8: Verify It's Working

```bash
# Check the health endpoint
curl http://localhost:8000/api/v1/health
```

**You should see:**
```json
{"status": "healthy", "version": "2.0.0"}
```

🎉 **Congratulations! AI PRO SPORTS is now running!**

---

## Step 9: Access From Your Browser

Your API is now available at:
```
http://YOUR_SERVER_IP:8000
```

API Documentation:
```
http://YOUR_SERVER_IP:8000/docs
```

---

## Step 10: Set Up Daily Tasks

```bash
# View the scheduled tasks (they run automatically)
docker compose exec api python -m app.cli.admin system status
```

The system will automatically:
- Collect odds every 60 seconds
- Update games every 5 minutes
- Generate predictions every 30 minutes
- Grade results every 15 minutes

---

## Common Questions

### How do I stop the application?

```bash
cd /opt/ai-pro-sports
docker compose down
```

### How do I restart the application?

```bash
cd /opt/ai-pro-sports
docker compose restart
```

### How do I see what's happening?

```bash
docker compose logs -f
```
Press `Ctrl+C` to stop watching logs.

### How do I update the application?

```bash
cd /opt/ai-pro-sports
docker compose down
git pull
docker compose up -d
```

### Something isn't working - what do I check?

```bash
# Check service status
docker compose ps

# Check for errors
docker compose logs --tail 50
```

---

## Troubleshooting

### Problem: "Cannot connect to Docker"

**Solution:**
```bash
sudo systemctl start docker
```

### Problem: "Port already in use"

**Solution:**
```bash
docker compose down
docker compose up -d
```

### Problem: "Database connection failed"

**Solution:** Check your DATABASE_PASSWORD in .env matches what you set.

### Problem: "No predictions showing"

**Solution:**
```bash
# Manually collect data
docker compose exec api python -m app.cli.admin data collect-odds -s NBA
docker compose exec api python -m app.cli.admin predict generate -s NBA
```

---

## Getting Help

If you're stuck:

1. Check the logs: `docker compose logs --tail 100`
2. Review the troubleshooting section
3. Check the detailed documentation in the `docs/` folder

---

## What's Next?

Now that your system is running:

1. **Add Security:** See `06_DEPLOYMENT_CHECKLIST.md` for SSL setup
2. **Monitor Performance:** See `31_GRAFANA_DASHBOARD_BUILDER.md`
3. **Understand Predictions:** See `27_PREDICTION_REASONING_GUIDE.md`

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Start | `docker compose up -d` |
| Stop | `docker compose down` |
| Restart | `docker compose restart` |
| Status | `docker compose ps` |
| Logs | `docker compose logs -f` |
| Health check | `curl localhost:8000/api/v1/health` |
| Collect odds | `docker compose exec api python -m app.cli.admin data collect-odds` |
| Generate predictions | `docker compose exec api python -m app.cli.admin predict generate` |

---

**You did it! 🎉**

Your AI PRO SPORTS prediction system is now up and running.

---

**Guide Version:** 2.0  
**Difficulty Level:** Beginner  
**Last Updated:** January 2026
