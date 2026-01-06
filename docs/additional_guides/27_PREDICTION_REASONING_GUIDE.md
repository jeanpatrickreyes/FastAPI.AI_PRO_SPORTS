# 27 - PREDICTION REASONING GUIDE

## AI PRO SPORTS - How Predictions Are Made

---

## Table of Contents

1. Prediction Pipeline Overview
2. Data Collection Phase
3. Feature Engineering Phase
4. Model Inference Phase
5. Probability Calibration
6. Signal Tier Assignment
7. SHAP Explanation Generation
8. Bet Sizing Calculation
9. Prediction Output Format
10. Reasoning Examples

---

## 1. Prediction Pipeline Overview

### End-to-End Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Raw Data  │ -> │  Features   │ -> │   Models    │
│  Collection │    │ Engineering │    │  Inference  │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                            v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Output    │ <- │  Bet Size   │ <- │ Calibration │
│ Prediction  │    │ Calculation │    │ + Tier      │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Processing Time

| Stage | Duration |
|-------|----------|
| Data fetch | 2-5 seconds |
| Feature engineering | 1-2 seconds |
| Model inference | 0.5-1 second |
| Calibration + sizing | 0.2 seconds |
| **Total** | **4-8 seconds per game** |

---

## 2. Data Collection Phase

### Data Sources Queried

| Source | Data Retrieved | Freshness |
|--------|----------------|-----------|
| TheOddsAPI | Current odds, line movement | Real-time |
| ESPN | Team stats, schedules, injuries | 5 min cache |
| Internal DB | ELO ratings, historical H2H | Pre-computed |
| Weather API | Outdoor game conditions | 30 min cache |

### Data Validation

Before prediction generation:

```python
def validate_game_data(game: Game) -> ValidationResult:
    checks = [
        ('odds_available', game.odds is not None),
        ('odds_fresh', game.odds_age_seconds < 300),
        ('teams_valid', game.home_team and game.away_team),
        ('game_not_started', game.start_time > datetime.utcnow()),
        ('features_complete', game.feature_completeness > 0.95)
    ]
    return ValidationResult(
        passed=all(c[1] for c in checks),
        details={c[0]: c[1] for c in checks}
    )
```

---

## 3. Feature Engineering Phase

### Feature Categories

The system computes **60-150 features** per game depending on sport:

#### Category A: Team Strength (15-20 features)
- ELO rating (home & away)
- ELO rating differential
- Net rating (offense - defense)
- Pythagorean win expectation
- Strength of schedule

#### Category B: Recent Form (12-15 features)
- Last 5/10 game record
- Win/loss streak
- Points scored/allowed last 5
- ATS (against the spread) record
- Home/away specific form

#### Category C: Rest & Schedule (8-10 features)
- Days since last game
- Back-to-back flag
- Games in last 7/14 days
- Travel distance
- Time zone changes

#### Category D: Head-to-Head (6-8 features)
- H2H record last 3 years
- H2H average margin
- H2H ATS record
- Last meeting result

#### Category E: Line Movement (8-10 features)
- Opening line
- Current line
- Line movement direction
- Steam move indicator
- Public betting percentage
- Reverse line movement flag

#### Category F: Situational (varies by sport)
- Weather factors (outdoor sports)
- Altitude adjustment
- Rivalry game flag
- Playoff implications
- Key injuries

### Feature Computation Example

```python
def compute_features(game: Game) -> np.ndarray:
    features = {}
    
    # ELO features
    features['home_elo'] = get_elo(game.home_team_id)
    features['away_elo'] = get_elo(game.away_team_id)
    features['elo_diff'] = features['home_elo'] - features['away_elo']
    
    # Form features
    home_form = get_recent_games(game.home_team_id, n=5)
    features['home_win_pct_l5'] = home_form.wins / 5
    features['home_ppg_l5'] = home_form.points_for / 5
    features['home_papg_l5'] = home_form.points_against / 5
    
    # Rest features
    features['home_rest_days'] = days_since_last_game(game.home_team_id)
    features['away_rest_days'] = days_since_last_game(game.away_team_id)
    features['rest_advantage'] = features['home_rest_days'] - features['away_rest_days']
    
    # Line features
    features['opening_spread'] = game.opening_spread
    features['current_spread'] = game.current_spread
    features['spread_movement'] = features['current_spread'] - features['opening_spread']
    
    return np.array([features[f] for f in FEATURE_ORDER])
```

---

## 4. Model Inference Phase

### Meta-Ensemble Architecture

Three model frameworks contribute to final prediction:

```
┌─────────────────────────────────────────────────────────┐
│                    Features (60-150)                     │
└────────────┬──────────────┬──────────────┬──────────────┘
             │              │              │
             v              v              v
      ┌──────────┐   ┌──────────┐   ┌──────────┐
      │ H2O Auto │   │AutoGluon │   │ Sklearn  │
      │   ML     │   │  Stack   │   │ Ensemble │
      │ (35%)    │   │  (45%)   │   │  (20%)   │
      └────┬─────┘   └────┬─────┘   └────┬─────┘
           │              │              │
           v              v              v
      ┌─────────────────────────────────────────┐
      │       Weighted Average Probability       │
      │   P = 0.35×P_h2o + 0.45×P_ag + 0.20×P_sk │
      └─────────────────────────────────────────┘
```

### Model Inference Code

```python
async def get_prediction(game: Game, features: np.ndarray) -> RawPrediction:
    # H2O prediction
    h2o_prob = h2o_model.predict_proba(features)[0][1]
    
    # AutoGluon prediction
    ag_prob = autogluon_model.predict_proba(features)[0][1]
    
    # Sklearn prediction
    sk_prob = sklearn_ensemble.predict_proba(features)[0][1]
    
    # Meta-ensemble combination
    raw_prob = (
        META_WEIGHTS['h2o'] * h2o_prob +
        META_WEIGHTS['autogluon'] * ag_prob +
        META_WEIGHTS['sklearn'] * sk_prob
    )
    
    return RawPrediction(
        probability=raw_prob,
        model_probs={'h2o': h2o_prob, 'ag': ag_prob, 'sk': sk_prob}
    )
```

---

## 5. Probability Calibration

### Why Calibration?

Raw model probabilities are often poorly calibrated. A model predicting "65% confidence" might actually win only 60% of the time. Calibration corrects this.

### Calibration Process

```python
def calibrate_probability(raw_prob: float, calibrator: IsotonicRegression) -> float:
    """
    Apply isotonic regression calibration to raw probability.
    
    Isotonic regression fits a monotonically increasing step function
    that maps raw probabilities to empirically accurate probabilities.
    """
    calibrated = calibrator.transform([[raw_prob]])[0][0]
    
    # Ensure bounds
    calibrated = max(0.50, min(0.95, calibrated))
    
    return calibrated
```

### Calibration Impact Example

| Raw Probability | Calibrated | Actual Win Rate |
|-----------------|------------|-----------------|
| 55% | 53% | 53% |
| 60% | 58% | 58% |
| 65% | 64% | 64% |
| 70% | 67% | 67% |
| 75% | 71% | 71% |

---

## 6. Signal Tier Assignment

### Tier Classification

```python
def assign_signal_tier(calibrated_prob: float) -> str:
    """
    Assign signal tier based on calibrated probability.
    
    Tier A: Elite predictions, highest confidence
    Tier B: Strong predictions, good value
    Tier C: Moderate confidence, reduced sizing
    Tier D: Low confidence, tracking only
    """
    if calibrated_prob >= 0.65:
        return 'A'
    elif calibrated_prob >= 0.60:
        return 'B'
    elif calibrated_prob >= 0.55:
        return 'C'
    else:
        return 'D'
```

### Tier Implications

| Tier | Betting Action | Kelly Multiplier |
|------|----------------|------------------|
| A | Maximum bet | 1.0× |
| B | Standard bet | 0.75× |
| C | Reduced bet | 0.25× |
| D | No bet | 0× |

---

## 7. SHAP Explanation Generation

### What is SHAP?

SHAP (SHapley Additive exPlanations) values show how each feature contributes to pushing the prediction above or below the baseline.

### SHAP Calculation

```python
def generate_explanation(model, features: np.ndarray, feature_names: List[str]) -> List[Dict]:
    """
    Generate SHAP explanation for prediction.
    """
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(features.reshape(1, -1))[0]
    
    # Sort by absolute impact
    feature_impacts = sorted(
        zip(feature_names, shap_values),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:10]  # Top 10 factors
    
    explanations = []
    for feature, impact in feature_impacts:
        explanations.append({
            'feature': feature,
            'value': features[feature_names.index(feature)],
            'impact': float(impact),
            'direction': 'positive' if impact > 0 else 'negative',
            'description': get_feature_description(feature, features)
        })
    
    return explanations
```

### Example SHAP Output

```json
{
  "explanations": [
    {
      "feature": "home_elo",
      "value": 1650,
      "impact": +0.12,
      "direction": "positive",
      "description": "Home team ELO rating (1650) is above average"
    },
    {
      "feature": "away_b2b",
      "value": 1,
      "impact": +0.08,
      "direction": "positive", 
      "description": "Away team playing back-to-back"
    },
    {
      "feature": "home_rest_days",
      "value": 3,
      "impact": +0.05,
      "direction": "positive",
      "description": "Home team has 3 days rest"
    },
    {
      "feature": "spread_movement",
      "value": -1.5,
      "impact": -0.04,
      "direction": "negative",
      "description": "Line moved 1.5 points against home team"
    }
  ]
}
```

---

## 8. Bet Sizing Calculation

### Kelly Criterion Application

```python
def calculate_bet_size(
    probability: float,
    odds: int,
    bankroll: float,
    signal_tier: str
) -> BetSizing:
    """
    Calculate recommended bet size using fractional Kelly.
    """
    # Convert odds to decimal
    decimal_odds = american_to_decimal(odds)
    b = decimal_odds - 1
    
    # Kelly formula
    q = 1 - probability
    full_kelly = (b * probability - q) / b
    
    # Apply fractional Kelly (25%)
    fractional = full_kelly * KELLY_FRACTION  # 0.25
    
    # Apply tier multiplier
    tier_multipliers = {'A': 1.0, 'B': 0.75, 'C': 0.25, 'D': 0.0}
    adjusted = fractional * tier_multipliers[signal_tier]
    
    # Cap at maximum
    final_fraction = min(adjusted, MAX_BET_PERCENT)  # 0.02
    
    # Calculate dollar amount
    bet_amount = bankroll * final_fraction
    
    return BetSizing(
        fraction=final_fraction,
        amount=bet_amount,
        kelly_full=full_kelly,
        kelly_fractional=fractional
    )
```

### Bet Sizing Example

```
Input:
  Probability: 65%
  Odds: -110 (decimal: 1.909)
  Bankroll: $10,000
  Signal Tier: A

Calculation:
  b = 0.909
  Full Kelly = (0.909 × 0.65 - 0.35) / 0.909 = 0.265 (26.5%)
  Fractional Kelly = 0.265 × 0.25 = 0.066 (6.6%)
  Tier A multiplier = 1.0
  Final = min(0.066, 0.02) = 0.02 (2%)
  
Output:
  Recommended bet: $200 (2% of $10,000)
```

---

## 9. Prediction Output Format

### Complete Prediction Object

```json
{
  "prediction_id": "pred_NBA_20260102_LAL_GSW_spread",
  "game_id": "game_12345",
  "sport": "NBA",
  "game_info": {
    "home_team": "Los Angeles Lakers",
    "away_team": "Golden State Warriors",
    "start_time": "2026-01-02T19:30:00Z",
    "venue": "Crypto.com Arena"
  },
  "prediction": {
    "market": "spread",
    "pick": "Lakers -3.5",
    "probability": 0.65,
    "confidence_interval": [0.60, 0.70],
    "signal_tier": "A",
    "edge": 0.076
  },
  "odds_info": {
    "current_line": -3.5,
    "current_odds": -110,
    "opening_line": -2.5,
    "best_odds": -105,
    "best_book": "pinnacle"
  },
  "betting": {
    "recommended_bet": 200.00,
    "bet_fraction": 0.02,
    "kelly_full": 0.265,
    "kelly_fractional": 0.066,
    "expected_value": 14.50,
    "expected_value_pct": 7.25
  },
  "reasoning": {
    "summary": "Lakers favored at home with rest advantage against Warriors on back-to-back.",
    "top_factors": [
      {"factor": "Home ELO advantage", "impact": "+12%"},
      {"factor": "Warriors B2B fatigue", "impact": "+8%"},
      {"factor": "Lakers 3-day rest", "impact": "+5%"},
      {"factor": "Line movement (-1.5 pts)", "impact": "-4%"}
    ]
  },
  "model_breakdown": {
    "h2o_probability": 0.63,
    "autogluon_probability": 0.67,
    "sklearn_probability": 0.61,
    "ensemble_weight": "35/45/20"
  },
  "integrity": {
    "sha256_hash": "a3b4c5d6e7f8...",
    "locked_at": "2026-01-02T15:00:00Z"
  },
  "metadata": {
    "model_version": "2.1.0",
    "generated_at": "2026-01-02T15:00:05Z",
    "expires_at": "2026-01-02T19:30:00Z"
  }
}
```

---

## 10. Reasoning Examples

### Example 1: High Confidence Spread Pick

**Game:** Lakers (-3.5) vs Warriors  
**Prediction:** Lakers -3.5 @ -110  
**Probability:** 65% | **Tier:** A

**Reasoning:**
> The model strongly favors the Lakers covering the 3.5-point spread based on multiple converging factors:
>
> 1. **ELO Advantage (+12%)**: Lakers' current ELO of 1650 vs Warriors' 1580 indicates a significant strength gap
> 2. **Rest Disparity (+8%)**: Warriors are playing their 4th game in 6 days while Lakers have had 3 days off
> 3. **Home Court (+5%)**: Lakers at home with historically strong crowd support
> 4. **Recent Form (+3%)**: Lakers 4-1 in last 5, Warriors 2-3
>
> The 1.5-point line movement toward Lakers (-4%) suggests some sharp action, but the value remains above our threshold.

### Example 2: Moderate Confidence Moneyline

**Game:** Chiefs vs Bills  
**Prediction:** Bills ML @ +140  
**Probability:** 58% | **Tier:** C

**Reasoning:**
> This is a closer game where our model finds modest value on the Bills at plus money:
>
> 1. **Bills at Home (+6%)**: Historically strong in Buffalo cold weather
> 2. **Chiefs Road Performance (-3%)**: Chiefs ATS road record is 4-6 this season
> 3. **Weather Factor (+4%)**: Sub-20°F expected, favors Buffalo preparation
> 4. **H2H Recency (+2%)**: Bills won last meeting by 7
>
> The 58% probability at +140 odds represents a 7.2% edge, but given the volatility of NFL games, this is classified as Tier C with reduced bet sizing.

### Example 3: No-Bet Tier D Analysis

**Game:** Rockets vs Thunder  
**Prediction:** Rockets +7.5 @ -110  
**Probability:** 53% | **Tier:** D

**Reasoning:**
> While the model slightly favors Rockets covering, confidence is below betting threshold:
>
> 1. **Thunder Home Dominance**: OKC 18-3 at home this season
> 2. **Rockets Injuries**: 2 starters questionable
> 3. **Model Uncertainty**: H2O (51%), AutoGluon (55%), Sklearn (52%) showing divergence
>
> **Recommendation:** Track only, no bet. Model consensus is weak.

---

## Prediction Quality Assurance

### Pre-Release Checks

| Check | Requirement | Auto-Verified |
|-------|-------------|---------------|
| Probability range | 0.50 - 0.95 | ✅ |
| Edge above threshold | ≥ 3% | ✅ |
| Odds freshness | < 5 minutes | ✅ |
| Model agreement | Variance < 10% | ✅ |
| SHAP generation | Top 5+ factors | ✅ |
| SHA-256 hash | Generated | ✅ |

---

**Guide Version:** 2.0  
**Last Updated:** January 2026
