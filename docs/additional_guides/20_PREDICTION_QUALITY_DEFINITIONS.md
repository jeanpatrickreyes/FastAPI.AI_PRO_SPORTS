# 20 - PREDICTION QUALITY DEFINITIONS

## AI PRO SPORTS - Quality Metrics & Standards

---

## Table of Contents

1. Quality Framework Overview
2. Accuracy Metrics
3. Calibration Metrics
4. Edge Quality Metrics
5. Model Performance Metrics
6. Signal Tier Quality Standards
7. Data Quality Metrics
8. Operational Quality Metrics
9. Quality Monitoring Dashboard
10. Quality Improvement Process

---

## 1. Quality Framework Overview

### Quality Pillars

AI PRO SPORTS predictions are evaluated across four quality pillars:

| Pillar | Description | Weight |
|--------|-------------|--------|
| **Accuracy** | Correct prediction rate | 35% |
| **Calibration** | Probability reliability | 25% |
| **Edge** | Value vs market | 25% |
| **Timeliness** | Delivery speed | 15% |

### Quality Score Formula

```
Quality Score = (Accuracy × 0.35) + (Calibration × 0.25) + 
               (Edge × 0.25) + (Timeliness × 0.15)
```

### Quality Grades

| Grade | Score Range | Status |
|-------|-------------|--------|
| A+ | 95-100 | Exceptional |
| A | 90-94 | Excellent |
| B | 80-89 | Good |
| C | 70-79 | Acceptable |
| D | 60-69 | Needs Improvement |
| F | <60 | Failing |

---

## 2. Accuracy Metrics

### 2.1 Overall Accuracy

**Definition:** Percentage of predictions that resulted in wins.

```
Accuracy = (Wins / Total Predictions) × 100
```

**Targets by Signal Tier:**

| Tier | Target Accuracy | Minimum Acceptable |
|------|-----------------|-------------------|
| A | ≥65% | 62% |
| B | ≥60% | 57% |
| C | ≥55% | 52% |
| D | ≥50% | N/A (no betting) |

### 2.2 Accuracy by Market Type

| Market | Target | Measurement |
|--------|--------|-------------|
| Spread | ≥55% | ATS (Against the Spread) |
| Moneyline | ≥58% | Straight-up wins |
| Totals | ≥55% | Over/Under accuracy |
| Props | ≥54% | Individual props |

### 2.3 Accuracy Calculation

```python
def calculate_accuracy(predictions: List[Prediction]) -> Dict:
    """Calculate comprehensive accuracy metrics."""
    
    results = {
        'overall': {'wins': 0, 'losses': 0, 'pushes': 0},
        'by_tier': {tier: {'wins': 0, 'losses': 0} for tier in ['A', 'B', 'C', 'D']},
        'by_market': {},
        'by_sport': {}
    }
    
    for pred in predictions:
        if pred.outcome == 'win':
            results['overall']['wins'] += 1
            results['by_tier'][pred.signal_tier]['wins'] += 1
        elif pred.outcome == 'loss':
            results['overall']['losses'] += 1
            results['by_tier'][pred.signal_tier]['losses'] += 1
        else:
            results['overall']['pushes'] += 1
    
    # Calculate percentages
    total = results['overall']['wins'] + results['overall']['losses']
    results['accuracy'] = results['overall']['wins'] / total * 100 if total > 0 else 0
    
    return results
```

### 2.4 Rolling Accuracy Windows

| Window | Purpose | Alert Threshold |
|--------|---------|-----------------|
| Last 7 days | Short-term trend | < Target - 5% |
| Last 30 days | Medium-term | < Target - 3% |
| Last 90 days | Seasonal | < Target - 2% |
| All-time | Baseline | < Target |

---

## 3. Calibration Metrics

### 3.1 Expected Calibration Error (ECE)

**Definition:** Average difference between predicted probability and actual outcome frequency.

```
ECE = Σ (|accuracy(bin) - confidence(bin)|) × (count(bin) / total)
```

**Target:** ECE < 0.05 (5%)

### 3.2 Brier Score

**Definition:** Mean squared error of probability predictions.

```
Brier Score = (1/N) × Σ (probability - outcome)²
```

**Interpretation:**
| Score | Quality |
|-------|---------|
| 0.00 - 0.10 | Excellent |
| 0.10 - 0.20 | Good |
| 0.20 - 0.25 | Acceptable |
| > 0.25 | Poor |

### 3.3 Calibration Calculation

```python
def calculate_calibration_metrics(predictions: List[Prediction]) -> Dict:
    """Calculate calibration quality metrics."""
    
    # Bin predictions by probability
    bins = {i/10: {'predicted': [], 'actual': []} for i in range(5, 10)}
    
    for pred in predictions:
        bin_key = round(pred.probability * 10) / 10
        if bin_key in bins:
            bins[bin_key]['predicted'].append(pred.probability)
            bins[bin_key]['actual'].append(1 if pred.outcome == 'win' else 0)
    
    # Calculate ECE
    ece = 0
    total_count = len(predictions)
    
    for bin_key, data in bins.items():
        if data['actual']:
            bin_accuracy = sum(data['actual']) / len(data['actual'])
            bin_confidence = sum(data['predicted']) / len(data['predicted'])
            bin_weight = len(data['actual']) / total_count
            ece += abs(bin_accuracy - bin_confidence) * bin_weight
    
    # Calculate Brier Score
    brier = sum(
        (p.probability - (1 if p.outcome == 'win' else 0))**2 
        for p in predictions
    ) / len(predictions)
    
    return {
        'ece': ece,
        'brier_score': brier,
        'calibration_bins': bins
    }
```

### 3.4 Reliability Diagram

Predictions are well-calibrated when the reliability curve follows the diagonal:

```
100% |                              *
     |                         *
 A   |                    *
 c   |               *
 t   |          *
 u   |     *
 a   | *
 l   |________________________________
     0%    Predicted Probability   100%
```

---

## 4. Edge Quality Metrics

### 4.1 Edge Definition

**Edge** = Our implied probability - Market implied probability

```python
def calculate_edge(our_prob: float, market_odds: int) -> float:
    """Calculate edge over market."""
    market_prob = american_to_implied(market_odds)
    edge = our_prob - market_prob
    return edge * 100  # Return as percentage
```

### 4.2 Edge Thresholds

| Tier | Minimum Edge | Target Edge |
|------|--------------|-------------|
| A | 5% | 8%+ |
| B | 3% | 5%+ |
| C | 2% | 3%+ |
| D | N/A | N/A |

### 4.3 Edge Distribution Analysis

```python
def analyze_edge_distribution(predictions: List[Prediction]) -> Dict:
    """Analyze the distribution of prediction edges."""
    
    edges = [p.edge for p in predictions]
    
    return {
        'mean_edge': np.mean(edges),
        'median_edge': np.median(edges),
        'std_edge': np.std(edges),
        'edge_percentiles': {
            '25th': np.percentile(edges, 25),
            '50th': np.percentile(edges, 50),
            '75th': np.percentile(edges, 75),
            '90th': np.percentile(edges, 90)
        },
        'positive_edge_rate': sum(1 for e in edges if e > 0) / len(edges),
        'high_edge_rate': sum(1 for e in edges if e > 5) / len(edges)
    }
```

### 4.4 Edge vs Outcome Correlation

| Edge Range | Expected Win Rate | Actual Win Rate Check |
|------------|-------------------|----------------------|
| 0-2% | 50-52% | Monitor |
| 2-4% | 52-55% | Good |
| 4-6% | 55-58% | Very Good |
| 6-8% | 58-62% | Excellent |
| 8%+ | 62%+ | Elite |

---

## 5. Model Performance Metrics

### 5.1 AUC-ROC (Area Under Curve)

**Definition:** Model's ability to distinguish between winning and losing outcomes.

| AUC | Interpretation |
|-----|----------------|
| 0.90 - 1.00 | Excellent |
| 0.80 - 0.90 | Good |
| 0.70 - 0.80 | Fair |
| 0.60 - 0.70 | Poor |
| 0.50 - 0.60 | No skill |

**Target:** AUC > 0.65 for all sports

### 5.2 Log Loss

**Definition:** Measures the uncertainty of predictions.

```
Log Loss = -(1/N) × Σ [y × log(p) + (1-y) × log(1-p)]
```

**Target:** Log Loss < 0.65

### 5.3 Model Comparison Matrix

| Model | AUC | Log Loss | Brier | Weight |
|-------|-----|----------|-------|--------|
| H2O AutoML | 0.67 | 0.62 | 0.21 | 35% |
| AutoGluon | 0.69 | 0.60 | 0.20 | 45% |
| Sklearn | 0.64 | 0.64 | 0.23 | 20% |
| **Ensemble** | **0.70** | **0.59** | **0.19** | 100% |

### 5.4 Model Drift Detection

```python
def detect_model_drift(model_id: str, window_days: int = 30) -> Dict:
    """Detect if model performance is degrading."""
    
    # Get baseline performance (training)
    baseline = get_model_baseline_metrics(model_id)
    
    # Get recent performance
    recent = get_recent_performance(model_id, window_days)
    
    # Calculate drift
    drift = {
        'auc_drift': baseline['auc'] - recent['auc'],
        'accuracy_drift': baseline['accuracy'] - recent['accuracy'],
        'calibration_drift': recent['ece'] - baseline['ece']
    }
    
    # Determine drift severity
    drift['severity'] = 'none'
    if drift['auc_drift'] > 0.03 or drift['accuracy_drift'] > 3:
        drift['severity'] = 'minor'
    if drift['auc_drift'] > 0.05 or drift['accuracy_drift'] > 5:
        drift['severity'] = 'major'
    if drift['auc_drift'] > 0.08 or drift['accuracy_drift'] > 8:
        drift['severity'] = 'critical'
    
    return drift
```

---

## 6. Signal Tier Quality Standards

### 6.1 Tier A Quality Requirements

| Metric | Requirement | Measurement Period |
|--------|-------------|-------------------|
| Confidence | ≥65% | Per prediction |
| Accuracy | ≥65% | Rolling 100 predictions |
| CLV | ≥+2% | Rolling 50 predictions |
| Edge | ≥5% | Per prediction |
| Calibration | ECE < 3% | Rolling 200 predictions |

### 6.2 Tier B Quality Requirements

| Metric | Requirement | Measurement Period |
|--------|-------------|-------------------|
| Confidence | 60-64% | Per prediction |
| Accuracy | ≥60% | Rolling 100 predictions |
| CLV | ≥+1% | Rolling 50 predictions |
| Edge | ≥3% | Per prediction |
| Calibration | ECE < 4% | Rolling 200 predictions |

### 6.3 Tier C Quality Requirements

| Metric | Requirement | Measurement Period |
|--------|-------------|-------------------|
| Confidence | 55-59% | Per prediction |
| Accuracy | ≥55% | Rolling 100 predictions |
| CLV | ≥0% | Rolling 50 predictions |
| Edge | ≥2% | Per prediction |
| Calibration | ECE < 5% | Rolling 200 predictions |

### 6.4 Tier Quality Monitoring

```python
TIER_QUALITY_ALERTS = {
    'A': {
        'accuracy_threshold': 62,  # Alert if below
        'clv_threshold': 1.5,
        'sample_size': 50,
        'alert_channel': 'critical'
    },
    'B': {
        'accuracy_threshold': 57,
        'clv_threshold': 0.5,
        'sample_size': 75,
        'alert_channel': 'warning'
    },
    'C': {
        'accuracy_threshold': 52,
        'clv_threshold': -0.5,
        'sample_size': 100,
        'alert_channel': 'info'
    }
}
```

---

## 7. Data Quality Metrics

### 7.1 Data Completeness

| Data Type | Completeness Target | Check |
|-----------|---------------------|-------|
| Odds | 100% for tracked books | All markets present |
| Games | 100% | All scheduled games |
| Scores | 100% within 15min | Final scores |
| Features | ≥95% | Feature availability |

### 7.2 Data Freshness

| Data Type | Freshness Target | Alert Threshold |
|-----------|------------------|-----------------|
| Live Odds | < 60 seconds | > 2 minutes |
| Game Schedules | < 5 minutes | > 15 minutes |
| Scores | < 15 minutes | > 30 minutes |
| Closing Lines | < 1 minute | > 5 minutes |

### 7.3 Data Accuracy

| Validation | Rule | Action on Failure |
|------------|------|-------------------|
| Odds Range | -1000 to +1000 | Reject |
| Spread Range | -50 to +50 | Reject |
| Total Range | 50 to 350 | Reject |
| Team Existence | Valid team_id | Skip game |
| Date Validity | Future date | Skip game |

---

## 8. Operational Quality Metrics

### 8.1 System Availability

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly |
| API Latency P50 | < 100ms | Hourly |
| API Latency P99 | < 500ms | Hourly |
| Error Rate | < 0.1% | Daily |

### 8.2 Prediction Delivery

| Metric | Target | Measurement |
|--------|--------|-------------|
| Pre-game Delivery | 100% | 1 hour before game |
| Delivery Latency | < 30 minutes | After odds available |
| Update Frequency | Every 30 min | During active hours |

### 8.3 Operational SLOs

```python
OPERATIONAL_SLOS = {
    'prediction_availability': {
        'target': 99.5,
        'measurement': 'predictions_generated / games_scheduled',
        'window': '7_days'
    },
    'prediction_timeliness': {
        'target': 95,
        'measurement': 'on_time_predictions / total_predictions',
        'window': '7_days'
    },
    'grading_accuracy': {
        'target': 100,
        'measurement': 'correct_grades / total_grades',
        'window': '30_days'
    }
}
```

---

## 9. Quality Monitoring Dashboard

### 9.1 Key Quality Indicators (KQIs)

| KQI | Formula | Target | Current |
|-----|---------|--------|---------|
| Overall Quality Score | Weighted composite | > 85 | -- |
| Tier A Hit Rate | A wins / A total | > 65% | -- |
| Model Health | AUC trend | Stable | -- |
| Data Quality Score | Completeness × Freshness | > 95% | -- |
| CLV Performance | Rolling 30-day avg | > +1.5% | -- |

### 9.2 Dashboard Panels

1. **Real-time Accuracy** - Last 24h, 7d, 30d by tier
2. **Calibration Chart** - Reliability diagram
3. **Edge Distribution** - Histogram of edges
4. **CLV Trend** - Rolling CLV over time
5. **Model Performance** - AUC trend per sport
6. **Data Quality** - Freshness and completeness
7. **Alerts** - Active quality alerts

---

## 10. Quality Improvement Process

### 10.1 Quality Review Cycle

| Frequency | Review | Actions |
|-----------|--------|---------|
| Daily | Accuracy check | Tier adjustment |
| Weekly | CLV analysis | Model parameter tuning |
| Monthly | Full quality audit | Retrain if needed |
| Quarterly | Strategy review | Architecture changes |

### 10.2 Improvement Triggers

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Tier A accuracy < 62% | 50 bets | Pause tier, investigate |
| CLV < 0% (7 day) | 30 bets | Review model |
| AUC drop > 5% | Any | Trigger retrain |
| Calibration ECE > 8% | 100 bets | Recalibrate |

### 10.3 Quality Improvement Workflow

```
1. Detection → Alert triggered
2. Analysis → Root cause identified
3. Action → Fix implemented
4. Verification → Metrics monitored
5. Documentation → Lessons learned
```

---

## Quality Definitions Summary

| Term | Definition | Target |
|------|------------|--------|
| Accuracy | Win percentage | ≥55% overall |
| Calibration | Probability reliability | ECE < 5% |
| Edge | Value vs market | ≥3% for bets |
| CLV | Closing line value | > +1.5% |
| AUC | Model discrimination | > 0.65 |
| Brier Score | Probability accuracy | < 0.22 |

---

**Document Version:** 2.0  
**Last Updated:** January 2026
