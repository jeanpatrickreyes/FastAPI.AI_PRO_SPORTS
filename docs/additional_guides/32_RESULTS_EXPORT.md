# 32 - RESULTS EXPORT GUIDE

## AI PRO SPORTS - Data Export & Reporting

---

## Table of Contents

1. Export Overview
2. API Export Endpoints
3. CLI Export Commands
4. Export Formats
5. Scheduled Reports
6. Custom Report Builder
7. Data Filtering Options
8. Export Templates
9. Integration with External Tools
10. Troubleshooting

---

## 1. Export Overview

### Available Export Types

| Export Type | Formats | Description |
|-------------|---------|-------------|
| Predictions | CSV, JSON, Excel | All predictions with outcomes |
| Betting History | CSV, JSON, Excel | Bet records and P/L |
| Performance Reports | PDF, Excel | Summary analytics |
| CLV Analysis | CSV, JSON | Closing line value data |
| Model Metrics | JSON | ML model performance |
| Raw Data | CSV | Database table exports |

### Export Capabilities

- **Real-time exports** via API
- **Scheduled exports** (daily, weekly, monthly)
- **Filtered exports** by date, sport, tier
- **Aggregated reports** with calculations
- **Multiple formats** for different use cases

---

## 2. API Export Endpoints

### 2.1 Predictions Export

```http
GET /api/v1/export/predictions
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | date | Start of date range (YYYY-MM-DD) |
| `end_date` | date | End of date range |
| `sport` | string | Filter by sport code |
| `tier` | string | Filter by signal tier (A, B, C, D) |
| `outcome` | string | Filter by outcome (win, loss, push) |
| `format` | string | Output format (csv, json, xlsx) |

**Example:**
```bash
curl -X GET "https://api.example.com/api/v1/export/predictions?start_date=2026-01-01&end_date=2026-01-31&sport=NBA&format=csv" \
  -H "Authorization: Bearer your-token" \
  -o predictions_january.csv
```

**Response (JSON):**
```json
{
  "export_id": "exp_12345",
  "format": "csv",
  "record_count": 456,
  "file_url": "https://storage.example.com/exports/predictions_12345.csv",
  "expires_at": "2026-01-02T12:00:00Z"
}
```

### 2.2 Betting History Export

```http
GET /api/v1/export/bets
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | date | Start of date range |
| `end_date` | date | End of date range |
| `sport` | string | Filter by sport |
| `min_stake` | number | Minimum stake filter |
| `include_clv` | boolean | Include CLV data |
| `format` | string | Output format |

### 2.3 Performance Report Export

```http
GET /api/v1/export/performance
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | daily, weekly, monthly, custom |
| `start_date` | date | Start date (for custom) |
| `end_date` | date | End date (for custom) |
| `group_by` | string | sport, tier, both |
| `format` | string | pdf, xlsx, json |

### 2.4 CLV Analysis Export

```http
GET /api/v1/export/clv
Authorization: Bearer {token}
```

**Includes:**
- Bet line vs closing line
- CLV percentage
- Aggregate CLV by sport/tier
- CLV trend over time

---

## 3. CLI Export Commands

### 3.1 Export Predictions

```bash
# Export all predictions for a date range
python -m app.cli.admin export predictions \
  --start-date 2026-01-01 \
  --end-date 2026-01-31 \
  --format csv \
  --output ./exports/predictions_jan.csv

# Export Tier A predictions only
python -m app.cli.admin export predictions \
  --tier A \
  --days 30 \
  --format xlsx \
  --output ./exports/tier_a_30days.xlsx
```

### 3.2 Export Betting History

```bash
# Full betting history
python -m app.cli.admin export bets \
  --include-clv \
  --format csv \
  --output ./exports/all_bets.csv

# By sport
python -m app.cli.admin export bets \
  --sport NBA \
  --days 90 \
  --format xlsx \
  --output ./exports/nba_bets.xlsx
```

### 3.3 Generate Performance Report

```bash
# Monthly performance report
python -m app.cli.admin export report \
  --type monthly \
  --month 2026-01 \
  --format pdf \
  --output ./reports/january_2026.pdf

# Weekly summary
python -m app.cli.admin export report \
  --type weekly \
  --format xlsx \
  --output ./reports/weekly_summary.xlsx
```

### 3.4 Export Model Metrics

```bash
# Current model performance
python -m app.cli.admin export models \
  --include-history \
  --format json \
  --output ./exports/model_metrics.json
```

---

## 4. Export Formats

### 4.1 CSV Format

**Best for:** Spreadsheet import, data analysis tools

**Predictions CSV Columns:**
```
prediction_id,created_at,sport,game_id,matchup,prediction_type,predicted_side,probability,signal_tier,odds,edge,outcome,profit_loss,clv
```

**Example:**
```csv
prediction_id,created_at,sport,matchup,predicted_side,probability,signal_tier,odds,outcome,profit_loss
pred_001,2026-01-15T10:30:00Z,NBA,Lakers vs Warriors,Lakers -3.5,0.65,A,-110,win,90.91
pred_002,2026-01-15T11:00:00Z,NFL,Chiefs vs Bills,Bills +3,0.58,C,-105,loss,-100.00
```

### 4.2 JSON Format

**Best for:** API integration, programmatic processing

**Structure:**
```json
{
  "export_info": {
    "generated_at": "2026-01-15T12:00:00Z",
    "record_count": 100,
    "filters_applied": {
      "sport": "NBA",
      "tier": "A"
    }
  },
  "data": [
    {
      "prediction_id": "pred_001",
      "created_at": "2026-01-15T10:30:00Z",
      "sport": "NBA",
      "game": {
        "id": "game_123",
        "home_team": "Lakers",
        "away_team": "Warriors",
        "start_time": "2026-01-15T19:30:00Z"
      },
      "prediction": {
        "type": "spread",
        "side": "Lakers -3.5",
        "probability": 0.65,
        "signal_tier": "A",
        "odds": -110,
        "edge": 0.076
      },
      "result": {
        "outcome": "win",
        "actual_margin": 7,
        "profit_loss": 90.91,
        "clv": 1.5
      }
    }
  ],
  "summary": {
    "total_predictions": 100,
    "wins": 65,
    "losses": 35,
    "accuracy": 0.65,
    "total_profit": 1250.00,
    "average_clv": 1.8
  }
}
```

### 4.3 Excel Format (XLSX)

**Best for:** Business reporting, manual analysis

**Sheets Included:**
1. **Summary** - Overview statistics
2. **Predictions** - Detailed prediction data
3. **By Sport** - Breakdown by sport
4. **By Tier** - Breakdown by signal tier
5. **Charts** - Visual representations

### 4.4 PDF Format

**Best for:** Formal reports, documentation

**Sections:**
1. Executive Summary
2. Performance Overview
3. Detailed Statistics
4. Charts and Graphs
5. Appendix with raw data summary

---

## 5. Scheduled Reports

### 5.1 Configure Scheduled Exports

```python
# app/config/scheduled_exports.py

SCHEDULED_EXPORTS = {
    'daily_summary': {
        'schedule': '0 6 * * *',  # 6 AM daily
        'type': 'performance',
        'period': 'daily',
        'format': 'xlsx',
        'recipients': ['team@example.com'],
        'storage': 's3://reports/daily/'
    },
    'weekly_report': {
        'schedule': '0 8 * * 1',  # Monday 8 AM
        'type': 'performance',
        'period': 'weekly',
        'format': 'pdf',
        'recipients': ['management@example.com'],
        'storage': 's3://reports/weekly/'
    },
    'monthly_clv': {
        'schedule': '0 9 1 * *',  # 1st of month, 9 AM
        'type': 'clv_analysis',
        'period': 'monthly',
        'format': 'xlsx',
        'recipients': ['analytics@example.com'],
        'storage': 's3://reports/monthly/'
    }
}
```

### 5.2 Email Report Delivery

```python
async def send_scheduled_report(report_config: dict):
    """Generate and email scheduled report."""
    
    # Generate export
    export_file = await generate_export(
        export_type=report_config['type'],
        period=report_config['period'],
        format=report_config['format']
    )
    
    # Upload to storage
    storage_url = await upload_to_storage(
        export_file, 
        report_config['storage']
    )
    
    # Send email
    await send_email(
        to=report_config['recipients'],
        subject=f"AI PRO SPORTS - {report_config['type'].title()} Report",
        body=generate_report_email_body(report_config),
        attachments=[export_file]
    )
```

---

## 6. Custom Report Builder

### 6.1 Report Configuration

```python
class CustomReport:
    def __init__(self, config: dict):
        self.config = config
    
    def build(self) -> Report:
        report = Report()
        
        # Add sections based on config
        if 'summary' in self.config['sections']:
            report.add_section(self.build_summary())
        
        if 'predictions' in self.config['sections']:
            report.add_section(self.build_predictions_table())
        
        if 'performance_by_sport' in self.config['sections']:
            report.add_section(self.build_sport_breakdown())
        
        if 'clv_analysis' in self.config['sections']:
            report.add_section(self.build_clv_section())
        
        if 'charts' in self.config['sections']:
            report.add_section(self.build_charts())
        
        return report
```

### 6.2 Custom Report API

```http
POST /api/v1/export/custom
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Q1 Performance Analysis",
  "date_range": {
    "start": "2026-01-01",
    "end": "2026-03-31"
  },
  "filters": {
    "sports": ["NBA", "NFL"],
    "tiers": ["A", "B"],
    "min_edge": 0.03
  },
  "sections": [
    "summary",
    "predictions",
    "performance_by_sport",
    "performance_by_tier",
    "clv_analysis",
    "charts"
  ],
  "format": "pdf",
  "email_to": ["user@example.com"]
}
```

---

## 7. Data Filtering Options

### 7.1 Date Filters

| Filter | Format | Example |
|--------|--------|---------|
| `start_date` | YYYY-MM-DD | 2026-01-01 |
| `end_date` | YYYY-MM-DD | 2026-01-31 |
| `days` | integer | 30 (last 30 days) |
| `period` | string | daily, weekly, monthly, yearly |

### 7.2 Sport Filters

```
sport=NBA          # Single sport
sport=NBA,NFL,MLB  # Multiple sports
sport=all          # All sports (default)
```

### 7.3 Tier Filters

```
tier=A          # Tier A only
tier=A,B        # Tier A and B
tier=!D         # All except Tier D
```

### 7.4 Outcome Filters

```
outcome=win           # Wins only
outcome=loss          # Losses only
outcome=win,loss      # Settled bets
outcome=pending       # Pending results
```

### 7.5 Advanced Filters

```
min_probability=0.60    # Minimum probability
max_probability=0.75    # Maximum probability
min_edge=0.03           # Minimum edge
min_odds=-200           # Minimum odds
max_odds=+150           # Maximum odds
```

---

## 8. Export Templates

### 8.1 Daily Performance Template

```json
{
  "template_id": "daily_performance",
  "sections": [
    {
      "type": "stats_grid",
      "metrics": ["predictions", "wins", "losses", "accuracy", "roi", "clv"]
    },
    {
      "type": "table",
      "title": "Today's Results",
      "columns": ["time", "sport", "pick", "odds", "outcome", "profit"]
    },
    {
      "type": "chart",
      "chart_type": "bar",
      "title": "Accuracy by Tier"
    }
  ]
}
```

### 8.2 Weekly Summary Template

```json
{
  "template_id": "weekly_summary",
  "sections": [
    {
      "type": "header",
      "title": "Weekly Performance Summary"
    },
    {
      "type": "comparison",
      "compare": ["this_week", "last_week", "4_week_avg"]
    },
    {
      "type": "breakdown",
      "group_by": "sport"
    },
    {
      "type": "breakdown",
      "group_by": "tier"
    },
    {
      "type": "chart",
      "chart_type": "line",
      "title": "Bankroll Trend"
    }
  ]
}
```

---

## 9. Integration with External Tools

### 9.1 Google Sheets Integration

```python
async def export_to_google_sheets(
    spreadsheet_id: str,
    sheet_name: str,
    data: List[dict]
):
    """Export data directly to Google Sheets."""
    
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
    
    creds = Credentials.from_service_account_file('credentials.json')
    service = build('sheets', 'v4', credentials=creds)
    
    # Prepare data
    headers = list(data[0].keys())
    rows = [[row[h] for h in headers] for row in data]
    values = [headers] + rows
    
    # Write to sheet
    service.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id,
        range=f"{sheet_name}!A1",
        valueInputOption='RAW',
        body={'values': values}
    ).execute()
```

### 9.2 Slack Export Notification

```python
async def notify_export_ready(export_info: dict, channel: str):
    """Send Slack notification when export is ready."""
    
    message = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "📊 Export Ready"}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Type:* {export_info['type']}"},
                    {"type": "mrkdwn", "text": f"*Records:* {export_info['count']}"},
                    {"type": "mrkdwn", "text": f"*Format:* {export_info['format']}"},
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "Download"},
                        "url": export_info['download_url']
                    }
                ]
            }
        ]
    }
    
    await send_slack_message(channel, message)
```

### 9.3 S3 Storage Integration

```python
async def upload_export_to_s3(
    file_path: str,
    bucket: str,
    key: str
) -> str:
    """Upload export file to S3 and return URL."""
    
    import boto3
    
    s3 = boto3.client('s3')
    s3.upload_file(file_path, bucket, key)
    
    # Generate presigned URL (valid for 7 days)
    url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket, 'Key': key},
        ExpiresIn=604800
    )
    
    return url
```

---

## 10. Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Export timeout | Large dataset | Use pagination or date filters |
| Empty export | No matching data | Check filters |
| Format error | Invalid parameters | Verify format option |
| Permission denied | Invalid token | Refresh authentication |

### Export Limits

| Limit | Value |
|-------|-------|
| Max records per export | 100,000 |
| Max file size | 100 MB |
| Export retention | 7 days |
| Concurrent exports | 5 per user |

### Debug Export Issues

```bash
# Check export status
python -m app.cli.admin export status --id exp_12345

# View export logs
python -m app.cli.admin export logs --days 1

# Test export configuration
python -m app.cli.admin export test --type predictions --format csv
```

---

## Quick Reference

### CLI Commands

| Command | Description |
|---------|-------------|
| `export predictions` | Export predictions |
| `export bets` | Export betting history |
| `export report` | Generate performance report |
| `export models` | Export model metrics |
| `export status` | Check export status |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/export/predictions` | GET | Export predictions |
| `/export/bets` | GET | Export bets |
| `/export/performance` | GET | Performance report |
| `/export/clv` | GET | CLV analysis |
| `/export/custom` | POST | Custom report |

---

**Guide Version:** 2.0  
**Last Updated:** January 2026
