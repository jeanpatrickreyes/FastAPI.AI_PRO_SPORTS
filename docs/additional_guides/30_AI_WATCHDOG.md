# 30 - AI WATCHDOG SYSTEM

## AI PRO SPORTS - Automated Monitoring & Self-Healing

---

## Table of Contents

1. Watchdog Overview
2. Health Monitoring
3. Self-Healing Mechanisms
4. Alert Rules
5. Anomaly Detection
6. Performance Monitoring
7. Data Quality Watchdog
8. Model Drift Detection
9. Automated Responses
10. Configuration Reference

---

## 1. Watchdog Overview

### What is AI Watchdog?

The AI Watchdog is an automated monitoring system that continuously monitors all aspects of AI PRO SPORTS and takes corrective action when problems are detected.

### Core Functions

| Function | Description |
|----------|-------------|
| Health Monitoring | Check all services every 30 seconds |
| Self-Healing | Auto-restart failed services |
| Anomaly Detection | Identify unusual patterns |
| Alert Management | Notify appropriate channels |
| Performance Tracking | Monitor latency and throughput |
| Data Quality | Validate incoming data |
| Model Drift | Detect accuracy degradation |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AI WATCHDOG                          │
├─────────────┬─────────────┬─────────────┬──────────────┤
│   Health    │   Anomaly   │    Data     │    Model     │
│   Monitor   │   Detector  │   Validator │    Monitor   │
├─────────────┴─────────────┴─────────────┴──────────────┤
│                  Alert Manager                          │
├─────────────┬─────────────┬─────────────┬──────────────┤
│  Telegram   │    Slack    │    Email    │   PagerDuty  │
└─────────────┴─────────────┴─────────────┴──────────────┘
```

---

## 2. Health Monitoring

### Service Health Checks

```python
HEALTH_CHECKS = {
    'api': {
        'endpoint': 'http://localhost:8000/api/v1/health',
        'interval': 30,  # seconds
        'timeout': 5,
        'expected_status': 200,
        'critical': True
    },
    'database': {
        'type': 'postgres',
        'query': 'SELECT 1',
        'interval': 60,
        'timeout': 10,
        'critical': True
    },
    'redis': {
        'type': 'redis',
        'command': 'PING',
        'interval': 30,
        'timeout': 5,
        'critical': True
    },
    'odds_collector': {
        'type': 'process',
        'check': 'last_run_within',
        'threshold': 120,  # seconds
        'critical': True
    },
    'prediction_engine': {
        'type': 'process',
        'check': 'last_prediction_within',
        'threshold': 3600,  # 1 hour
        'critical': False
    }
}
```

### Health Check Implementation

```python
class HealthMonitor:
    def __init__(self):
        self.status = {}
        self.failure_counts = {}
        
    async def check_all(self) -> Dict[str, HealthStatus]:
        results = {}
        
        for service, config in HEALTH_CHECKS.items():
            try:
                status = await self.check_service(service, config)
                results[service] = status
                
                if status.healthy:
                    self.failure_counts[service] = 0
                else:
                    self.failure_counts[service] = self.failure_counts.get(service, 0) + 1
                    
                    # Trigger self-healing after 3 failures
                    if self.failure_counts[service] >= 3:
                        await self.trigger_healing(service, config)
                        
            except Exception as e:
                results[service] = HealthStatus(
                    healthy=False,
                    error=str(e)
                )
        
        return results
    
    async def check_service(self, service: str, config: dict) -> HealthStatus:
        if config['type'] == 'http':
            return await self.check_http(config)
        elif config['type'] == 'postgres':
            return await self.check_postgres(config)
        elif config['type'] == 'redis':
            return await self.check_redis(config)
        elif config['type'] == 'process':
            return await self.check_process(config)
```

### Health Status Dashboard

| Service | Status | Last Check | Response Time |
|---------|--------|------------|---------------|
| API | 🟢 Healthy | 30s ago | 45ms |
| Database | 🟢 Healthy | 60s ago | 12ms |
| Redis | 🟢 Healthy | 30s ago | 2ms |
| Odds Collector | 🟢 Healthy | 45s ago | N/A |
| ML Models | 🟢 Healthy | 5m ago | 850ms |

---

## 3. Self-Healing Mechanisms

### Automatic Recovery Actions

```python
HEALING_ACTIONS = {
    'api': {
        'action': 'restart_container',
        'container': 'ai-pro-sports-api',
        'max_attempts': 3,
        'cooldown': 300  # 5 minutes
    },
    'database': {
        'action': 'restart_container',
        'container': 'ai-pro-sports-postgres',
        'max_attempts': 2,
        'cooldown': 600,
        'pre_action': 'backup_database'
    },
    'redis': {
        'action': 'restart_container',
        'container': 'ai-pro-sports-redis',
        'max_attempts': 3,
        'cooldown': 60
    },
    'odds_collector': {
        'action': 'restart_task',
        'task': 'collect_odds',
        'max_attempts': 5,
        'cooldown': 60
    },
    'high_memory': {
        'action': 'clear_cache',
        'threshold': 0.85,  # 85% memory usage
        'clear_targets': ['redis', 'model_cache']
    }
}
```

### Self-Healing Implementation

```python
class SelfHealer:
    def __init__(self):
        self.attempt_counts = {}
        self.last_attempts = {}
        
    async def trigger_healing(self, service: str, config: dict):
        action_config = HEALING_ACTIONS.get(service)
        if not action_config:
            return
        
        # Check cooldown
        last_attempt = self.last_attempts.get(service, 0)
        if time.time() - last_attempt < action_config['cooldown']:
            return
        
        # Check max attempts
        attempts = self.attempt_counts.get(service, 0)
        if attempts >= action_config['max_attempts']:
            await self.escalate(service, 'Max healing attempts reached')
            return
        
        # Execute healing action
        self.attempt_counts[service] = attempts + 1
        self.last_attempts[service] = time.time()
        
        action = action_config['action']
        
        if action == 'restart_container':
            await self.restart_container(action_config['container'])
        elif action == 'restart_task':
            await self.restart_task(action_config['task'])
        elif action == 'clear_cache':
            await self.clear_cache(action_config['clear_targets'])
        
        # Log healing action
        await self.log_healing_action(service, action)
        
    async def restart_container(self, container: str):
        """Restart a Docker container."""
        import docker
        client = docker.from_env()
        container_obj = client.containers.get(container)
        container_obj.restart(timeout=30)
        
    async def restart_task(self, task: str):
        """Restart a background task."""
        from app.tasks import task_registry
        task_registry[task].restart()
        
    async def clear_cache(self, targets: List[str]):
        """Clear specified caches."""
        for target in targets:
            if target == 'redis':
                await redis.flushdb()
            elif target == 'model_cache':
                model_manager.clear_cache()
```

### Healing Event Log

| Timestamp | Service | Action | Result |
|-----------|---------|--------|--------|
| 2026-01-02 14:30:00 | api | restart_container | Success |
| 2026-01-02 14:25:00 | redis | restart_container | Success |
| 2026-01-02 13:00:00 | odds_collector | restart_task | Success |

---

## 4. Alert Rules

### Alert Configuration

```python
ALERT_RULES = {
    # Critical Alerts (SEV1)
    'system_down': {
        'condition': 'api_health == false AND consecutive_failures >= 3',
        'severity': 'SEV1',
        'channels': ['pagerduty', 'telegram', 'slack', 'email'],
        'message': '🔴 CRITICAL: AI PRO SPORTS API is DOWN',
        'auto_heal': True
    },
    'database_down': {
        'condition': 'database_health == false',
        'severity': 'SEV1',
        'channels': ['pagerduty', 'telegram', 'slack'],
        'message': '🔴 CRITICAL: Database connection lost',
        'auto_heal': True
    },
    
    # High Alerts (SEV2)
    'data_stale': {
        'condition': 'odds_age > 300',  # 5 minutes
        'severity': 'SEV2',
        'channels': ['telegram', 'slack'],
        'message': '🟠 WARNING: Odds data is stale (>5 min old)',
        'auto_heal': True
    },
    'high_error_rate': {
        'condition': 'error_rate > 0.01',  # 1%
        'severity': 'SEV2',
        'channels': ['slack', 'email'],
        'message': '🟠 WARNING: API error rate above 1%'
    },
    
    # Medium Alerts (SEV3)
    'model_degradation': {
        'condition': 'accuracy_7d < accuracy_baseline - 0.05',
        'severity': 'SEV3',
        'channels': ['slack'],
        'message': '🟡 NOTICE: Model accuracy dropped >5%'
    },
    'high_latency': {
        'condition': 'p99_latency > 2000',  # 2 seconds
        'severity': 'SEV3',
        'channels': ['slack'],
        'message': '🟡 NOTICE: API latency above 2s'
    },
    
    # Low Alerts (SEV4)
    'disk_warning': {
        'condition': 'disk_usage > 0.75',
        'severity': 'SEV4',
        'channels': ['email'],
        'message': '🔵 INFO: Disk usage above 75%'
    },
    
    # Positive Alerts
    'tier_a_prediction': {
        'condition': 'new_prediction AND signal_tier == A',
        'severity': 'INFO',
        'channels': ['telegram'],
        'message': '🎯 NEW TIER A: {matchup} - {pick} ({probability}%)'
    }
}
```

### Alert Manager

```python
class AlertManager:
    def __init__(self):
        self.sent_alerts = {}  # Track to prevent duplicates
        
    async def evaluate_rules(self, metrics: Dict):
        for rule_name, rule in ALERT_RULES.items():
            if self.evaluate_condition(rule['condition'], metrics):
                await self.send_alert(rule_name, rule, metrics)
    
    async def send_alert(self, rule_name: str, rule: dict, metrics: dict):
        # Check for duplicate suppression
        key = f"{rule_name}_{rule['severity']}"
        last_sent = self.sent_alerts.get(key, 0)
        
        suppression_time = {
            'SEV1': 60,    # 1 minute
            'SEV2': 300,   # 5 minutes
            'SEV3': 1800,  # 30 minutes
            'SEV4': 3600   # 1 hour
        }.get(rule['severity'], 300)
        
        if time.time() - last_sent < suppression_time:
            return
        
        self.sent_alerts[key] = time.time()
        
        # Format message
        message = rule['message'].format(**metrics)
        
        # Send to all channels
        for channel in rule['channels']:
            await self.send_to_channel(channel, message, rule['severity'])
    
    async def send_to_channel(self, channel: str, message: str, severity: str):
        if channel == 'telegram':
            await telegram_bot.send_message(message)
        elif channel == 'slack':
            await slack_client.post_message(message, severity)
        elif channel == 'email':
            await email_service.send(message, severity)
        elif channel == 'pagerduty':
            await pagerduty.trigger_incident(message, severity)
```

---

## 5. Anomaly Detection

### Anomaly Types

| Type | Description | Detection Method |
|------|-------------|------------------|
| Probability Bias | Model predicting one side too often | Chi-square test |
| Edge Inflation | Unusually high edges | Z-score threshold |
| Volume Anomaly | Unusual prediction count | Rolling average deviation |
| Accuracy Drop | Sudden accuracy decline | CUSUM algorithm |
| Data Gap | Missing data periods | Time gap analysis |

### Anomaly Detection Implementation

```python
class AnomalyDetector:
    def __init__(self):
        self.baselines = {}
        
    async def detect_anomalies(self) -> List[Anomaly]:
        anomalies = []
        
        # Check probability distribution
        prob_anomaly = await self.check_probability_bias()
        if prob_anomaly:
            anomalies.append(prob_anomaly)
        
        # Check edge distribution
        edge_anomaly = await self.check_edge_inflation()
        if edge_anomaly:
            anomalies.append(edge_anomaly)
        
        # Check accuracy trend
        accuracy_anomaly = await self.check_accuracy_drop()
        if accuracy_anomaly:
            anomalies.append(accuracy_anomaly)
        
        return anomalies
    
    async def check_probability_bias(self) -> Optional[Anomaly]:
        """Check if predictions are biased toward one side."""
        recent_preds = await get_recent_predictions(hours=24)
        
        home_picks = sum(1 for p in recent_preds if p.pick_side == 'home')
        away_picks = len(recent_preds) - home_picks
        
        # Chi-square test for uniform distribution
        expected = len(recent_preds) / 2
        chi_sq = ((home_picks - expected)**2 + (away_picks - expected)**2) / expected
        
        if chi_sq > 6.635:  # p < 0.01
            return Anomaly(
                type='probability_bias',
                severity='medium',
                message=f'Home/Away bias detected: {home_picks}/{away_picks}',
                value=chi_sq
            )
        
        return None
    
    async def check_edge_inflation(self) -> Optional[Anomaly]:
        """Check for unusually high edges."""
        recent_edges = await get_recent_edges(hours=24)
        
        mean_edge = np.mean(recent_edges)
        std_edge = np.std(recent_edges)
        baseline_mean = self.baselines.get('edge_mean', 0.03)
        
        z_score = (mean_edge - baseline_mean) / (std_edge / np.sqrt(len(recent_edges)))
        
        if z_score > 3:  # 3 sigma
            return Anomaly(
                type='edge_inflation',
                severity='high',
                message=f'Edge inflation detected: {mean_edge:.2%} vs baseline {baseline_mean:.2%}',
                value=z_score
            )
        
        return None
```

---

## 6. Performance Monitoring

### Metrics Collected

```python
PERFORMANCE_METRICS = {
    'api': {
        'request_count': Counter('api_requests_total'),
        'request_latency': Histogram('api_request_latency_seconds'),
        'error_count': Counter('api_errors_total'),
        'active_connections': Gauge('api_active_connections')
    },
    'predictions': {
        'generated_count': Counter('predictions_generated_total'),
        'generation_latency': Histogram('prediction_generation_seconds'),
        'tier_distribution': Counter('predictions_by_tier')
    },
    'ml': {
        'inference_latency': Histogram('ml_inference_seconds'),
        'model_accuracy': Gauge('model_accuracy_7d'),
        'feature_computation_time': Histogram('feature_computation_seconds')
    },
    'system': {
        'cpu_usage': Gauge('system_cpu_percent'),
        'memory_usage': Gauge('system_memory_percent'),
        'disk_usage': Gauge('system_disk_percent'),
        'gpu_usage': Gauge('gpu_utilization_percent'),
        'gpu_memory': Gauge('gpu_memory_percent')
    }
}
```

### Performance Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| API P50 Latency | > 100ms | > 500ms |
| API P99 Latency | > 500ms | > 2000ms |
| Error Rate | > 0.5% | > 1% |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 75% | > 90% |
| Disk Usage | > 75% | > 90% |
| GPU Usage | > 80% | > 95% |

---

## 7. Data Quality Watchdog

### Data Quality Checks

```python
DATA_QUALITY_RULES = {
    'odds_freshness': {
        'check': 'max_age',
        'threshold': 120,  # seconds
        'critical': True
    },
    'odds_completeness': {
        'check': 'required_fields',
        'fields': ['spread', 'total', 'moneyline'],
        'min_coverage': 0.95
    },
    'odds_validity': {
        'check': 'range',
        'rules': {
            'spread': {'min': -50, 'max': 50},
            'total': {'min': 50, 'max': 350},
            'odds': {'min': -2000, 'max': 2000}
        }
    },
    'game_data': {
        'check': 'required_fields',
        'fields': ['home_team', 'away_team', 'start_time'],
        'min_coverage': 1.0
    },
    'feature_completeness': {
        'check': 'null_ratio',
        'max_null_ratio': 0.05
    }
}
```

### Data Quality Monitor

```python
class DataQualityMonitor:
    async def run_checks(self) -> DataQualityReport:
        report = DataQualityReport()
        
        # Check odds freshness
        latest_odds = await get_latest_odds_timestamp()
        age = (datetime.utcnow() - latest_odds).total_seconds()
        report.add_check('odds_freshness', age < 120, f'{age:.0f}s old')
        
        # Check completeness
        games_today = await get_todays_games()
        games_with_odds = sum(1 for g in games_today if g.has_odds)
        coverage = games_with_odds / len(games_today) if games_today else 0
        report.add_check('odds_coverage', coverage >= 0.95, f'{coverage:.1%}')
        
        # Check validity
        invalid_odds = await count_invalid_odds()
        report.add_check('odds_validity', invalid_odds == 0, f'{invalid_odds} invalid')
        
        # Check features
        null_ratio = await get_feature_null_ratio()
        report.add_check('feature_completeness', null_ratio < 0.05, f'{null_ratio:.1%} null')
        
        return report
```

---

## 8. Model Drift Detection

### Drift Metrics

```python
MODEL_DRIFT_CONFIG = {
    'accuracy_baseline': {
        'window': 90,  # days
        'threshold': 0.05  # 5% drop triggers alert
    },
    'calibration_drift': {
        'metric': 'ece',
        'threshold': 0.08  # ECE > 8% triggers alert
    },
    'feature_drift': {
        'method': 'psi',  # Population Stability Index
        'threshold': 0.25
    },
    'prediction_distribution': {
        'method': 'ks_test',  # Kolmogorov-Smirnov
        'threshold': 0.05  # p-value
    }
}
```

### Drift Detection Implementation

```python
class ModelDriftDetector:
    async def detect_drift(self, model_id: str) -> DriftReport:
        report = DriftReport(model_id=model_id)
        
        # Accuracy drift
        baseline_acc = await get_baseline_accuracy(model_id)
        current_acc = await get_current_accuracy(model_id, days=7)
        
        if baseline_acc - current_acc > 0.05:
            report.add_drift(
                type='accuracy',
                severity='high',
                baseline=baseline_acc,
                current=current_acc
            )
        
        # Calibration drift
        current_ece = await calculate_ece(model_id, days=7)
        if current_ece > 0.08:
            report.add_drift(
                type='calibration',
                severity='medium',
                value=current_ece
            )
        
        # Feature drift (PSI)
        for feature in TOP_FEATURES:
            psi = await calculate_psi(feature, model_id)
            if psi > 0.25:
                report.add_drift(
                    type='feature',
                    feature=feature,
                    severity='medium',
                    value=psi
                )
        
        return report
```

---

## 9. Automated Responses

### Response Playbooks

```python
RESPONSE_PLAYBOOKS = {
    'api_down': [
        {'action': 'restart_api', 'wait': 30},
        {'action': 'check_health', 'retry': 3},
        {'action': 'escalate_if_failed', 'channel': 'pagerduty'}
    ],
    'data_stale': [
        {'action': 'restart_collector', 'wait': 60},
        {'action': 'verify_api_key'},
        {'action': 'check_rate_limits'},
        {'action': 'notify_if_failed', 'channel': 'slack'}
    ],
    'model_drift': [
        {'action': 'flag_model', 'status': 'degraded'},
        {'action': 'notify', 'channel': 'slack'},
        {'action': 'schedule_retrain', 'priority': 'high'}
    ],
    'high_memory': [
        {'action': 'clear_cache'},
        {'action': 'check_memory', 'wait': 60},
        {'action': 'restart_if_needed'}
    ]
}

class PlaybookExecutor:
    async def execute(self, playbook_name: str, context: dict):
        playbook = RESPONSE_PLAYBOOKS[playbook_name]
        
        for step in playbook:
            action = step['action']
            
            try:
                result = await self.run_action(action, step, context)
                
                if step.get('wait'):
                    await asyncio.sleep(step['wait'])
                    
                if result.failed and 'escalate_if_failed' in step:
                    await self.escalate(step['escalate_if_failed'], context)
                    break
                    
            except Exception as e:
                logger.error(f"Playbook step failed: {action} - {e}")
```

---

## 10. Configuration Reference

### Complete Watchdog Configuration

```yaml
# watchdog_config.yaml

general:
  enabled: true
  check_interval: 30  # seconds
  log_level: INFO

health_monitoring:
  enabled: true
  services:
    - api
    - database
    - redis
    - odds_collector
    - prediction_engine

self_healing:
  enabled: true
  max_attempts: 3
  cooldown_seconds: 300

alerting:
  channels:
    telegram:
      enabled: true
      bot_token: ${TELEGRAM_BOT_TOKEN}
      chat_id: ${TELEGRAM_CHAT_ID}
    slack:
      enabled: true
      webhook_url: ${SLACK_WEBHOOK_URL}
    email:
      enabled: true
      smtp_host: smtp.gmail.com
      smtp_port: 587
    pagerduty:
      enabled: false
      api_key: ${PAGERDUTY_API_KEY}

anomaly_detection:
  enabled: true
  checks:
    - probability_bias
    - edge_inflation
    - accuracy_drop
    - volume_anomaly

model_drift:
  enabled: true
  check_interval: 3600  # 1 hour
  accuracy_threshold: 0.05
  ece_threshold: 0.08

data_quality:
  enabled: true
  check_interval: 60
  freshness_threshold: 120
  completeness_threshold: 0.95
```

### Environment Variables

```bash
# Watchdog Configuration
WATCHDOG_ENABLED=true
WATCHDOG_INTERVAL=30
WATCHDOG_LOG_LEVEL=INFO

# Alert Channels
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
ALERT_EMAIL_RECIPIENTS=admin@example.com

# Thresholds
HEALTH_CHECK_TIMEOUT=5
DATA_FRESHNESS_THRESHOLD=120
ACCURACY_DRIFT_THRESHOLD=0.05
```

---

## Watchdog CLI Commands

```bash
# Check watchdog status
python -m app.cli.admin watchdog status

# Run manual health check
python -m app.cli.admin watchdog health-check

# Test alert channels
python -m app.cli.admin watchdog test-alerts

# View recent alerts
python -m app.cli.admin watchdog alerts --last 24h

# View healing events
python -m app.cli.admin watchdog healing-log
```

---

**Document Version:** 2.0  
**Last Updated:** January 2026
