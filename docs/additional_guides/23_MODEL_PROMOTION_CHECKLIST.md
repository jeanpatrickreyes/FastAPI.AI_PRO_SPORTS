# 23 - MODEL PROMOTION CHECKLIST

## AI PRO SPORTS - ML Model Deployment Verification

---

## Overview

This checklist must be completed before promoting any ML model to production. Each section requires sign-off from the appropriate team member.

---

## PHASE 1: MODEL TRAINING VERIFICATION

### 1.1 Training Data Quality

| Check | Requirement | Verified | Notes |
|-------|-------------|----------|-------|
| [ ] | Data freshness | Within 7 days | |
| [ ] | Sample size | ≥1000 games | |
| [ ] | Feature completeness | ≥95% | |
| [ ] | No data leakage | Walk-forward validated | |
| [ ] | COVID years excluded | 2020-2021 flagged | |
| [ ] | Class balance | 45-55% ratio | |

### 1.2 Training Configuration

| Parameter | Value | Verified |
|-----------|-------|----------|
| [ ] | Sport | _______ | ☐ |
| [ ] | Bet type | _______ | ☐ |
| [ ] | Training window | _______ days | ☐ |
| [ ] | Validation window | _______ days | ☐ |
| [ ] | Walk-forward folds | _______ | ☐ |
| [ ] | AutoGluon preset | _______ | ☐ |
| [ ] | H2O max models | _______ | ☐ |

### 1.3 Training Completion

| Check | Status |
|-------|--------|
| [ ] | H2O training completed without errors | ☐ |
| [ ] | AutoGluon training completed without errors | ☐ |
| [ ] | Sklearn ensemble trained | ☐ |
| [ ] | Meta-weights calculated | ☐ |
| [ ] | Models serialized successfully | ☐ |

---

## PHASE 2: PERFORMANCE VALIDATION

### 2.1 Primary Metrics

| Metric | Requirement | Actual | Pass |
|--------|-------------|--------|------|
| [ ] | AUC-ROC | ≥0.63 | _____ | ☐ |
| [ ] | Log Loss | ≤0.68 | _____ | ☐ |
| [ ] | Brier Score | ≤0.24 | _____ | ☐ |
| [ ] | Accuracy | ≥53% | _____ | ☐ |

### 2.2 Tier-Specific Performance

| Tier | Target Accuracy | Actual | Prediction Count | Pass |
|------|-----------------|--------|------------------|------|
| [ ] | A (≥65%) | _____ | _____ | ☐ |
| [ ] | B (≥60%) | _____ | _____ | ☐ |
| [ ] | C (≥55%) | _____ | _____ | ☐ |

### 2.3 Walk-Forward Results

| Fold | AUC | Accuracy | Stable |
|------|-----|----------|--------|
| 1 | _____ | _____ | ☐ |
| 2 | _____ | _____ | ☐ |
| 3 | _____ | _____ | ☐ |
| 4 | _____ | _____ | ☐ |
| 5 | _____ | _____ | ☐ |
| **Avg** | _____ | _____ | **Variance < 3%** |

### 2.4 Comparison to Current Production

| Metric | Current Model | New Model | Improvement |
|--------|---------------|-----------|-------------|
| AUC | _____ | _____ | _____ |
| Accuracy | _____ | _____ | _____ |
| Tier A Rate | _____ | _____ | _____ |
| CLV (historical) | _____ | _____ | _____ |

**Minimum Requirement:** New model must meet OR exceed current model on all metrics.

---

## PHASE 3: CALIBRATION VERIFICATION

### 3.1 Probability Calibration

| Check | Requirement | Actual | Pass |
|-------|-------------|--------|------|
| [ ] | ECE (Expected Calibration Error) | ≤0.05 | _____ | ☐ |
| [ ] | Reliability diagram reviewed | Linear fit | ☐ | ☐ |
| [ ] | Calibration method applied | Isotonic/Platt | _____ | ☐ |

### 3.2 Calibration Bins

| Predicted Prob | Sample Size | Actual Win Rate | Deviation |
|----------------|-------------|-----------------|-----------|
| 55-60% | _____ | _____ | _____ |
| 60-65% | _____ | _____ | _____ |
| 65-70% | _____ | _____ | _____ |
| 70-75% | _____ | _____ | _____ |
| 75%+ | _____ | _____ | _____ |

**Pass Criteria:** All deviations ≤ 5%

---

## PHASE 4: FEATURE VALIDATION

### 4.1 Feature Importance Review

| Rank | Feature | Importance | Expected | Verified |
|------|---------|------------|----------|----------|
| 1 | _________ | _____ | ☐ Yes / ☐ No | ☐ |
| 2 | _________ | _____ | ☐ Yes / ☐ No | ☐ |
| 3 | _________ | _____ | ☐ Yes / ☐ No | ☐ |
| 4 | _________ | _____ | ☐ Yes / ☐ No | ☐ |
| 5 | _________ | _____ | ☐ Yes / ☐ No | ☐ |

### 4.2 Feature Sanity Checks

| Check | Status |
|-------|--------|
| [ ] | No future-looking features | ☐ |
| [ ] | ELO features in top 10 | ☐ |
| [ ] | Recent form features present | ☐ |
| [ ] | No single feature > 30% importance | ☐ |
| [ ] | Feature correlations reviewed | ☐ |

### 4.3 SHAP Analysis

| Check | Status |
|-------|--------|
| [ ] | SHAP values generated | ☐ |
| [ ] | Top features align with domain knowledge | ☐ |
| [ ] | No unexpected feature interactions | ☐ |
| [ ] | Sample explanations reviewed | ☐ |

---

## PHASE 5: EDGE ANALYSIS

### 5.1 Historical Edge Distribution

| Edge Range | Count | Win Rate | Expected |
|------------|-------|----------|----------|
| 0-2% | _____ | _____ | ~52% |
| 2-4% | _____ | _____ | ~54% |
| 4-6% | _____ | _____ | ~57% |
| 6-8% | _____ | _____ | ~60% |
| 8%+ | _____ | _____ | ~63%+ |

### 5.2 Simulated CLV

| Check | Requirement | Actual | Pass |
|-------|-------------|--------|------|
| [ ] | Backtested CLV | ≥+1% | _____ | ☐ |
| [ ] | Simulated ROI | ≥+3% annually | _____ | ☐ |
| [ ] | Max drawdown | ≤20% | _____ | ☐ |
| [ ] | Sharpe ratio | ≥0.5 | _____ | ☐ |

---

## PHASE 6: TECHNICAL VALIDATION

### 6.1 Model Artifacts

| Artifact | Location | Verified |
|----------|----------|----------|
| [ ] | H2O model file | /models/h2o/_____ | ☐ |
| [ ] | AutoGluon model folder | /models/autogluon/_____ | ☐ |
| [ ] | Sklearn pickle | /models/sklearn/_____ | ☐ |
| [ ] | Calibrator pickle | /models/calibration/_____ | ☐ |
| [ ] | Feature scaler | /models/scalers/_____ | ☐ |
| [ ] | Meta-weights config | /models/config/_____ | ☐ |

### 6.2 Inference Testing

| Test | Expected | Actual | Pass |
|------|----------|--------|------|
| [ ] | Load time | < 30s | _____ | ☐ |
| [ ] | Single prediction latency | < 100ms | _____ | ☐ |
| [ ] | Batch prediction (100) | < 2s | _____ | ☐ |
| [ ] | Memory usage | < 8GB | _____ | ☐ |
| [ ] | GPU utilization (if applicable) | Working | _____ | ☐ |

### 6.3 Integration Testing

| Test | Status |
|------|--------|
| [ ] | Model loads in production environment | ☐ |
| [ ] | Predictions match expected format | ☐ |
| [ ] | SHAP explanations generate correctly | ☐ |
| [ ] | Signal tier assignment correct | ☐ |
| [ ] | Bet sizing calculations accurate | ☐ |

---

## PHASE 7: ROLLOUT PLAN

### 7.1 Deployment Strategy

| Stage | Duration | Traffic | Criteria to Proceed |
|-------|----------|---------|---------------------|
| Shadow | 3 days | 0% | No errors, predictions match |
| Canary | 3 days | 10% | Performance matches backtest |
| Gradual | 7 days | 50% | CLV positive |
| Full | Ongoing | 100% | All metrics pass |

### 7.2 Rollback Plan

| Trigger | Action | Responsible |
|---------|--------|-------------|
| Error rate > 1% | Immediate rollback | DevOps |
| Accuracy < baseline - 5% | Rollback within 24h | ML Team |
| CLV < -1% (3 day rolling) | Review, potential rollback | ML Lead |

### 7.3 Monitoring Setup

| Dashboard | Configured | Alert Rules Set |
|-----------|------------|-----------------|
| [ ] | Model performance | ☐ | ☐ |
| [ ] | Prediction volume | ☐ | ☐ |
| [ ] | Inference latency | ☐ | ☐ |
| [ ] | Error tracking | ☐ | ☐ |

---

## PHASE 8: SIGN-OFF

### Required Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| ML Engineer | ___________ | ___________ | _____ |
| ML Lead | ___________ | ___________ | _____ |
| DevOps Engineer | ___________ | ___________ | _____ |
| QA Engineer | ___________ | ___________ | _____ |
| Product Owner | ___________ | ___________ | _____ |

### Final Checklist

| Check | Status |
|-------|--------|
| [ ] | All Phase 1-7 items verified | ☐ |
| [ ] | Performance exceeds or matches current | ☐ |
| [ ] | Rollback plan documented | ☐ |
| [ ] | Monitoring configured | ☐ |
| [ ] | All approvals obtained | ☐ |

---

## PROMOTION COMMAND

```bash
# Promote model to production
python -m app.cli.admin model promote MODEL_ID \
    --sport NBA \
    --bet-type spread \
    --version 2.1.0 \
    --notes "Improved accuracy by 2%, new features added"

# Verify promotion
python -m app.cli.admin model list --status production
```

---

## POST-PROMOTION MONITORING

### Day 1-3 Checklist

- [ ] Monitor error rates every hour
- [ ] Compare live predictions to shadow predictions
- [ ] Track real-time CLV
- [ ] Review any anomalies

### Day 4-7 Checklist

- [ ] Evaluate accuracy vs baseline
- [ ] Compare CLV to historical
- [ ] Review operator feedback
- [ ] Document any issues

### Day 8+ 

- [ ] Full performance review
- [ ] Document lessons learned
- [ ] Update baseline metrics
- [ ] Close promotion ticket

---

**Checklist Version:** 2.0  
**Last Updated:** January 2026
