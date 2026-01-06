# 31 - GRAFANA DASHBOARD BUILDER

## AI PRO SPORTS - Complete Monitoring Dashboard Setup

---

## Table of Contents

1. Grafana Overview
2. Installation & Setup
3. Data Sources Configuration
4. Dashboard Templates
5. System Overview Dashboard
6. Predictions Dashboard
7. ML Performance Dashboard
8. Betting Performance Dashboard
9. Alerts Dashboard
10. Custom Panels & Queries

---

## 1. Grafana Overview

### What is Grafana?

Grafana is an open-source visualization platform that displays real-time metrics, logs, and alerts for AI PRO SPORTS.

### Dashboard Structure

| Dashboard | Purpose |
|-----------|---------|
| System Overview | Server health, API metrics |
| Predictions | Prediction volume, accuracy |
| ML Performance | Model metrics, drift detection |
| Betting Performance | ROI, CLV, bankroll |
| Alerts | Active alerts, history |

### Access Details

| Setting | Value |
|---------|-------|
| URL | http://localhost:3000 |
| Default User | admin |
| Default Password | admin |

---

## 2. Installation & Setup

### Docker Compose Configuration

```yaml
# docker-compose.yml
services:
  grafana:
    image: grafana/grafana:10.2.0
    container_name: ai-pro-sports-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    depends_on:
      - prometheus
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:v2.47.0
    container_name: ai-pro-sports-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    restart: unless-stopped

volumes:
  grafana_data:
  prometheus_data:
```

### Prometheus Configuration

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'ai-pro-sports-api'
    static_configs:
      - targets: ['api:8000']
    metrics_path: /metrics

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'nvidia-gpu'
    static_configs:
      - targets: ['nvidia-exporter:9400']
```

### Start Services

```bash
docker-compose up -d grafana prometheus
```

---

## 3. Data Sources Configuration

### Add Prometheus Data Source

1. Go to Configuration → Data Sources
2. Click "Add data source"
3. Select "Prometheus"
4. Configure:
   - URL: `http://prometheus:9090`
   - Access: Server (default)
5. Click "Save & Test"

### Add PostgreSQL Data Source

1. Add data source → PostgreSQL
2. Configure:
   - Host: `postgres:5432`
   - Database: `ai_pro_sports`
   - User: `${DB_USER}`
   - Password: `${DB_PASSWORD}`
   - TLS/SSL Mode: disable (for internal)
3. Save & Test

### Provisioning Data Sources (Automated)

```yaml
# grafana/provisioning/datasources/datasources.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true

  - name: PostgreSQL
    type: postgres
    url: postgres:5432
    database: ai_pro_sports
    user: ${DB_USER}
    secureJsonData:
      password: ${DB_PASSWORD}
    jsonData:
      sslmode: disable
```

---

## 4. Dashboard Templates

### Dashboard Provisioning

```yaml
# grafana/provisioning/dashboards/dashboards.yml
apiVersion: 1

providers:
  - name: 'AI PRO SPORTS'
    orgId: 1
    folder: 'AI PRO SPORTS'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
```

### Folder Structure

```
grafana/
├── provisioning/
│   ├── datasources/
│   │   └── datasources.yml
│   └── dashboards/
│       └── dashboards.yml
└── dashboards/
    ├── system-overview.json
    ├── predictions.json
    ├── ml-performance.json
    ├── betting-performance.json
    └── alerts.json
```

---

## 5. System Overview Dashboard

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  SYSTEM OVERVIEW                          Last 24 Hours     │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  API Health  │  DB Health   │ Redis Health │   GPU Status  │
│     🟢       │      🟢      │      🟢      │      🟢       │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  API Request Rate (requests/sec)                            │
│  [LINE GRAPH]                                               │
├─────────────────────────────┬───────────────────────────────┤
│  Response Time (ms)          │  Error Rate (%)              │
│  [LINE GRAPH P50/P95/P99]    │  [LINE GRAPH]                │
├─────────────────────────────┴───────────────────────────────┤
│  System Resources                                           │
│  CPU: [GAUGE] Memory: [GAUGE] Disk: [GAUGE] GPU: [GAUGE]   │
└─────────────────────────────────────────────────────────────┘
```

### Panel: API Request Rate

```json
{
  "title": "API Request Rate",
  "type": "timeseries",
  "datasource": "Prometheus",
  "targets": [
    {
      "expr": "rate(api_requests_total[5m])",
      "legendFormat": "{{method}} {{endpoint}}"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "reqps"
    }
  }
}
```

### Panel: Response Time Percentiles

```json
{
  "title": "API Response Time",
  "type": "timeseries",
  "targets": [
    {
      "expr": "histogram_quantile(0.50, rate(api_request_latency_seconds_bucket[5m]))",
      "legendFormat": "P50"
    },
    {
      "expr": "histogram_quantile(0.95, rate(api_request_latency_seconds_bucket[5m]))",
      "legendFormat": "P95"
    },
    {
      "expr": "histogram_quantile(0.99, rate(api_request_latency_seconds_bucket[5m]))",
      "legendFormat": "P99"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "s"
    }
  }
}
```

### Panel: System Health Stats

```json
{
  "title": "API Health",
  "type": "stat",
  "targets": [
    {
      "expr": "up{job='ai-pro-sports-api'}",
      "legendFormat": "API"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "mappings": [
        {"type": "value", "options": {"0": {"text": "DOWN", "color": "red"}}},
        {"type": "value", "options": {"1": {"text": "UP", "color": "green"}}}
      ]
    }
  }
}
```

---

## 6. Predictions Dashboard

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  PREDICTIONS DASHBOARD                    Last 7 Days       │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ Total Preds  │   Tier A     │   Tier B     │    Tier C     │
│    1,247     │     89       │     312      │     846       │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  Predictions by Sport (Pie Chart)                          │
│  [PIE CHART: NBA 35%, NFL 25%, NHL 20%, MLB 15%, Other 5%]│
├─────────────────────────────┬───────────────────────────────┤
│  Prediction Volume Over Time │  Tier Distribution Over Time │
│  [AREA CHART]                │  [STACKED BAR]               │
├─────────────────────────────┴───────────────────────────────┤
│  Recent Predictions Table                                   │
│  Time | Sport | Game | Pick | Tier | Prob | Result         │
└─────────────────────────────────────────────────────────────┘
```

### Panel: Predictions by Tier (Stat Panels)

```json
{
  "title": "Tier A Predictions",
  "type": "stat",
  "datasource": "PostgreSQL",
  "targets": [
    {
      "rawSql": "SELECT COUNT(*) FROM predictions WHERE signal_tier = 'A' AND created_at > NOW() - INTERVAL '7 days'",
      "format": "table"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "color": {"mode": "fixed", "fixedColor": "green"}
    }
  }
}
```

### Panel: Predictions by Sport (Pie Chart)

```json
{
  "title": "Predictions by Sport",
  "type": "piechart",
  "datasource": "PostgreSQL",
  "targets": [
    {
      "rawSql": "SELECT sport_code as metric, COUNT(*) as value FROM predictions WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY sport_code",
      "format": "table"
    }
  ]
}
```

### Panel: Recent Predictions Table

```json
{
  "title": "Recent Predictions",
  "type": "table",
  "datasource": "PostgreSQL",
  "targets": [
    {
      "rawSql": "SELECT created_at as \"Time\", sport_code as \"Sport\", game_description as \"Game\", pick as \"Pick\", signal_tier as \"Tier\", ROUND(probability * 100, 1) as \"Prob%\", outcome as \"Result\" FROM predictions ORDER BY created_at DESC LIMIT 50",
      "format": "table"
    }
  ],
  "fieldConfig": {
    "overrides": [
      {
        "matcher": {"id": "byName", "options": "Tier"},
        "properties": [
          {
            "id": "mappings",
            "value": [
              {"type": "value", "options": {"A": {"color": "green"}}},
              {"type": "value", "options": {"B": {"color": "yellow"}}},
              {"type": "value", "options": {"C": {"color": "orange"}}}
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 7. ML Performance Dashboard

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ML PERFORMANCE                           Last 30 Days      │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  Overall AUC │ Tier A Acc   │ Tier B Acc   │     ECE       │
│    0.68      │    67.2%     │    61.8%     │    0.042      │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  Accuracy Trend by Tier                                     │
│  [LINE CHART: Tier A (green), Tier B (yellow), Tier C (orange)]│
├─────────────────────────────┬───────────────────────────────┤
│  Model AUC by Sport          │  Calibration Chart           │
│  [BAR CHART]                 │  [SCATTER: Expected vs Actual]│
├─────────────────────────────┴───────────────────────────────┤
│  Feature Importance (Top 10)                                │
│  [HORIZONTAL BAR]                                           │
└─────────────────────────────────────────────────────────────┘
```

### Panel: Accuracy Trend

```json
{
  "title": "Accuracy by Tier (7-day rolling)",
  "type": "timeseries",
  "datasource": "PostgreSQL",
  "targets": [
    {
      "rawSql": "SELECT date_trunc('day', graded_at) as time, ROUND(AVG(CASE WHEN outcome = 'win' THEN 1.0 ELSE 0.0 END) * 100, 1) as \"Tier A\" FROM predictions WHERE signal_tier = 'A' AND graded_at > NOW() - INTERVAL '30 days' GROUP BY date_trunc('day', graded_at) ORDER BY time",
      "format": "time_series"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "percent"
    }
  }
}
```

### Panel: Model AUC by Sport

```json
{
  "title": "Model AUC by Sport",
  "type": "barchart",
  "datasource": "PostgreSQL",
  "targets": [
    {
      "rawSql": "SELECT sport_code, auc_score FROM ml_models WHERE status = 'production' ORDER BY auc_score DESC",
      "format": "table"
    }
  ],
  "options": {
    "orientation": "horizontal"
  }
}
```

---

## 8. Betting Performance Dashboard

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  BETTING PERFORMANCE                      All Time          │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  Total ROI   │   CLV        │  Win Rate    │   Total P/L   │
│   +4.2%      │   +1.8%      │   56.3%      │   +$4,200     │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  Bankroll Over Time                                         │
│  [AREA CHART: Growth from $10,000]                         │
├─────────────────────────────┬───────────────────────────────┤
│  ROI by Sport                │  ROI by Tier                 │
│  [BAR CHART]                 │  [BAR CHART]                 │
├─────────────────────────────┴───────────────────────────────┤
│  CLV Distribution                                           │
│  [HISTOGRAM]                                                │
├─────────────────────────────────────────────────────────────┤
│  Recent Bets Table                                          │
│  Date | Game | Pick | Odds | Stake | Result | P/L | CLV    │
└─────────────────────────────────────────────────────────────┘
```

### Panel: ROI Stat

```json
{
  "title": "Total ROI",
  "type": "stat",
  "datasource": "PostgreSQL",
  "targets": [
    {
      "rawSql": "SELECT ROUND(SUM(profit_loss) / SUM(stake) * 100, 2) as roi FROM bets WHERE settled = true",
      "format": "table"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "percent",
      "color": {"mode": "thresholds"},
      "thresholds": {
        "steps": [
          {"value": null, "color": "red"},
          {"value": 0, "color": "yellow"},
          {"value": 3, "color": "green"}
        ]
      }
    }
  }
}
```

### Panel: Bankroll Growth

```json
{
  "title": "Bankroll Over Time",
  "type": "timeseries",
  "datasource": "PostgreSQL",
  "targets": [
    {
      "rawSql": "SELECT settled_at as time, SUM(profit_loss) OVER (ORDER BY settled_at) + 10000 as bankroll FROM bets WHERE settled = true ORDER BY settled_at",
      "format": "time_series"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "currencyUSD",
      "custom": {"fillOpacity": 20}
    }
  }
}
```

---

## 9. Alerts Dashboard

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ALERTS                                   Last 24 Hours     │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  Active SEV1 │  Active SEV2 │  Active SEV3 │  Total Today  │
│      0       │      1       │      3       │      12       │
├──────────────┴──────────────┴──────────────┴───────────────┤
│  Alert Timeline                                             │
│  [ANNOTATIONS ON TIMELINE]                                  │
├─────────────────────────────────────────────────────────────┤
│  Active Alerts                                              │
│  Severity | Alert | Started | Duration | Status            │
├─────────────────────────────────────────────────────────────┤
│  Alert History                                              │
│  Time | Severity | Alert | Duration | Resolution           │
└─────────────────────────────────────────────────────────────┘
```

### Panel: Active Alerts Table

```json
{
  "title": "Active Alerts",
  "type": "table",
  "datasource": "PostgreSQL",
  "targets": [
    {
      "rawSql": "SELECT severity, alert_type, started_at, NOW() - started_at as duration, status FROM alerts WHERE status = 'active' ORDER BY CASE severity WHEN 'SEV1' THEN 1 WHEN 'SEV2' THEN 2 WHEN 'SEV3' THEN 3 ELSE 4 END",
      "format": "table"
    }
  ],
  "fieldConfig": {
    "overrides": [
      {
        "matcher": {"id": "byName", "options": "severity"},
        "properties": [
          {
            "id": "mappings",
            "value": [
              {"type": "value", "options": {"SEV1": {"color": "red", "text": "🔴 SEV1"}}},
              {"type": "value", "options": {"SEV2": {"color": "orange", "text": "🟠 SEV2"}}},
              {"type": "value", "options": {"SEV3": {"color": "yellow", "text": "🟡 SEV3"}}}
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 10. Custom Panels & Queries

### Useful PromQL Queries

```promql
# API Request Rate
rate(api_requests_total[5m])

# Error Rate
rate(api_errors_total[5m]) / rate(api_requests_total[5m]) * 100

# P99 Latency
histogram_quantile(0.99, rate(api_request_latency_seconds_bucket[5m]))

# CPU Usage
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory Usage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# GPU Utilization
nvidia_gpu_utilization

# Predictions per minute
rate(predictions_generated_total[5m]) * 60
```

### Useful SQL Queries

```sql
-- Daily prediction accuracy
SELECT 
  DATE(graded_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN outcome = 'win' THEN 1 ELSE 0 END) as wins,
  ROUND(AVG(CASE WHEN outcome = 'win' THEN 1.0 ELSE 0.0 END) * 100, 1) as accuracy
FROM predictions
WHERE graded_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(graded_at)
ORDER BY date;

-- CLV by sport
SELECT 
  sport_code,
  ROUND(AVG(clv_percentage), 2) as avg_clv,
  COUNT(*) as bet_count
FROM clv_records
GROUP BY sport_code
ORDER BY avg_clv DESC;

-- Top performing model features
SELECT feature_name, importance_score
FROM feature_importance
WHERE model_id = (SELECT id FROM ml_models WHERE status = 'production' LIMIT 1)
ORDER BY importance_score DESC
LIMIT 10;
```

### Dashboard Variables

```json
{
  "templating": {
    "list": [
      {
        "name": "sport",
        "type": "query",
        "datasource": "PostgreSQL",
        "query": "SELECT DISTINCT sport_code FROM predictions",
        "multi": true,
        "includeAll": true
      },
      {
        "name": "tier",
        "type": "custom",
        "options": [
          {"text": "All", "value": "$__all"},
          {"text": "Tier A", "value": "A"},
          {"text": "Tier B", "value": "B"},
          {"text": "Tier C", "value": "C"}
        ]
      },
      {
        "name": "timeRange",
        "type": "interval",
        "options": [
          {"text": "Last 24h", "value": "24h"},
          {"text": "Last 7d", "value": "7d"},
          {"text": "Last 30d", "value": "30d"}
        ]
      }
    ]
  }
}
```

---

## Quick Setup Commands

```bash
# Import dashboards via API
curl -X POST http://admin:${GRAFANA_PASSWORD}@localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @grafana/dashboards/system-overview.json

# Export dashboard
curl http://admin:${GRAFANA_PASSWORD}@localhost:3000/api/dashboards/uid/system-overview \
  > system-overview-backup.json

# Create API key for automated access
curl -X POST http://admin:${GRAFANA_PASSWORD}@localhost:3000/api/auth/keys \
  -H "Content-Type: application/json" \
  -d '{"name":"automation","role":"Admin"}'
```

---

**Guide Version:** 2.0  
**Last Updated:** January 2026
