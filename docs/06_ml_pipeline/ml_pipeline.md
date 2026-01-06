# AI PRO SPORTS - ML Pipeline and Algorithms

## Document Information
- **Version**: 2.0
- **Last Updated**: January 2026
- **Classification**: Enterprise Documentation

---

## 1. Problem Formulation

### 1.1 Prediction Problems Overview

| Problem Type | Target Variable | Algorithm Class | Use Case |
|--------------|-----------------|-----------------|----------|
| Binary Classification | Win/Cover/Over | Gradient Boosting, Neural Networks | Spread, Moneyline, Total predictions |
| Probability Estimation | P(outcome) | Calibrated Classifiers | Kelly Criterion calculations |
| Regression | Point margin | Gradient Boosting, LSTM | Projected scores, player props |
| Ranking | Team strength | ELO, Bradley-Terry | Power rankings, matchup analysis |
| Expected Value | ROI estimate | Ensemble + Calibration | Bet recommendation |

### 1.2 Target Variable Definitions

#### Spread Prediction Target
- **Definition**: Binary outcome indicating if favorite covered the spread
- **Value 1**: Home team covers (home_score - away_score > spread)
- **Value 0**: Away team covers
- **Push Handling**: Excluded from training (marked as push in grading)

#### Moneyline Prediction Target
- **Definition**: Binary outcome indicating game winner
- **Value 1**: Home team wins
- **Value 0**: Away team wins
- **Tie Handling**: Sport-specific (OT included for most sports)

#### Total Prediction Target
- **Definition**: Binary outcome indicating over/under result
- **Value 1**: Combined score exceeds total line
- **Value 0**: Combined score under total line
- **Push Handling**: Excluded from training

#### Player Props Target
- **Definition**: Regression target for player statistical output
- **Target Types**: Points, rebounds, assists, yards, strikeouts, etc.
- **Binary Conversion**: Actual vs. line for over/under classification

---

## 2. Feature Engineering

### 2.1 Feature Categories

#### 2.1.1 Team Performance Features (Category A)

| Feature Name | Description | Calculation | Sports |
|--------------|-------------|-------------|--------|
| team_elo | ELO rating | Recursive ELO formula with sport-specific K | All |
| offensive_rating | Points per 100 possessions | (PTS / POSS) × 100 | Basketball |
| defensive_rating | Points allowed per 100 possessions | (OPP_PTS / POSS) × 100 | Basketball |
| net_rating | Offensive - Defensive rating | ORTG - DRTG | Basketball |
| pace | Possessions per game | Formula varies by sport | All |
| pythagorean_win_pct | Expected win % from PF/PA | PF^exp / (PF^exp + PA^exp) | All |
| points_per_game | Average points scored | Rolling mean over N games | All |
| points_allowed_per_game | Average points allowed | Rolling mean over N games | All |
| turnover_percentage | Turnovers per possession | TO / POSS | Basketball, Football |
| third_down_pct | Third down conversion rate | 3D_CONV / 3D_ATT | Football |
| red_zone_pct | Red zone scoring percentage | RZ_TD / RZ_ATT | Football |

#### 2.1.2 Recent Form Features (Category B)

| Feature Name | Description | Window | Sports |
|--------------|-------------|--------|--------|
| last_5_wins | Wins in last 5 games | 5 games | All |
| last_5_avg_margin | Average point differential | 5 games | All |
| last_10_wins | Wins in last 10 games | 10 games | All |
| win_streak | Current consecutive wins | Dynamic | All |
| lose_streak | Current consecutive losses | Dynamic | All |
| ats_last_5 | Against the spread record | 5 games | All |
| over_under_last_5 | Over/under record | 5 games | All |
| momentum_score | Weighted recent performance | Exponential decay | All |
| form_trend | Linear trend in performance | 10 games regression | All |

#### 2.1.3 Rest and Travel Features (Category C)

| Feature Name | Description | Calculation | Sports |
|--------------|-------------|-------------|--------|
| rest_days | Days since last game | Current date - last game date | All |
| rest_advantage | Rest days difference | Home rest - Away rest | All |
| back_to_back | Playing on consecutive days | Boolean flag | Basketball, Hockey |
| games_last_7 | Games played in last 7 days | Count | Basketball, Hockey, Baseball |
| games_last_14 | Games played in last 14 days | Count | All |
| travel_distance | Miles traveled for away game | Haversine distance | All |
| time_zone_change | Time zones crossed | Destination TZ - Origin TZ | All |
| road_trip_game | Game number in road trip | Counter | All |

#### 2.1.4 Head-to-Head Features (Category D)

| Feature Name | Description | Window | Sports |
|--------------|-------------|--------|--------|
| h2h_wins | Total wins against opponent | All time | All |
| h2h_losses | Total losses against opponent | All time | All |
| h2h_win_pct | Win percentage vs opponent | All time | All |
| h2h_last_5 | Wins in last 5 matchups | 5 games | All |
| h2h_avg_margin | Average margin vs opponent | All time | All |
| h2h_ats_record | ATS record vs opponent | All time | All |
| h2h_total_trend | Over/under trend vs opponent | Last 10 | All |

#### 2.1.5 Line Movement Features (Category E)

| Feature Name | Description | Calculation | Sports |
|--------------|-------------|-------------|--------|
| opening_spread | Opening line | First recorded spread | All |
| current_spread | Current line | Latest spread | All |
| spread_movement | Line change | Current - Opening | All |
| steam_move | Rapid line movement indicator | > 1 point in < 30 min | All |
| reverse_line_movement | RLM indicator | Line moves opposite to betting % | All |
| opening_total | Opening total line | First recorded total | All |
| total_movement | Total line change | Current - Opening | All |
| public_bet_pct_home | Public betting on home | Betting data | All |
| sharp_action_indicator | Sharp money detected | Proprietary calculation | All |

#### 2.1.6 Weather Features (Category F)

| Feature Name | Description | Range | Sports |
|--------------|-------------|-------|--------|
| temperature | Game time temperature | -20 to 120°F | Outdoor |
| wind_speed | Wind speed at game time | 0 to 50 mph | Outdoor |
| wind_direction | Wind direction relative to field | 0 to 360° | Outdoor |
| humidity | Relative humidity | 0 to 100% | Outdoor |
| precipitation_prob | Chance of precipitation | 0 to 100% | Outdoor |
| dome_indicator | Indoor/outdoor flag | Boolean | All |
| altitude | Venue altitude | Feet above sea level | All |

#### 2.1.7 Injury Features (Category G)

| Feature Name | Description | Calculation | Sports |
|--------------|-------------|-------------|--------|
| key_players_out | Count of starters out | Sum of OUT status | All |
| injury_impact_score | Weighted injury severity | Sum(player_value × injury_weight) | All |
| star_player_status | Star player availability | Categorical: OUT/Q/P/IN | All |
| backup_quality | Quality of replacements | Backup player ratings | All |

#### 2.1.8 Situational Features (Category H)

| Feature Name | Description | Sports |
|--------------|-------------|--------|
| home_indicator | Home/away flag | All |
| divisional_game | Same division matchup | All |
| conference_game | Same conference matchup | All |
| rivalry_game | Historical rivalry | All |
| playoff_implications | Playoff positioning impact | All |
| prime_time | National TV game | Football, Basketball |
| day_of_week | Day of week encoded | All |
| month_of_season | Month indicator | All |

#### 2.1.9 Advanced Metrics (Category I)

| Feature Name | Description | Sports |
|--------------|-------------|--------|
| expected_points_added | EPA per play | Football |
| success_rate | Play success rate | Football |
| dvoa | Defense-adjusted Value Over Average | Football |
| war | Wins Above Replacement | Baseball |
| wrc_plus | Weighted Runs Created Plus | Baseball |
| fip | Fielding Independent Pitching | Baseball |
| corsi | Shot attempt differential | Hockey |
| expected_goals | xG model output | Hockey |
| true_shooting_pct | True shooting percentage | Basketball |
| effective_fg_pct | Effective field goal % | Basketball |

### 2.2 Feature Computation Methods

#### 2.2.1 Rolling Statistics
- **Windows**: 3, 5, 10, 15, 30 games
- **Methods**: Mean, standard deviation, min, max, trend
- **Weighting**: Exponential decay with configurable half-life

#### 2.2.2 ELO Rating System

**Formula**:
```
New Rating = Old Rating + K × (Actual - Expected)

Expected = 1 / (1 + 10^((Opponent Rating - Team Rating) / 400))

Actual = 1 for win, 0.5 for tie, 0 for loss
```

**Sport-Specific K Factors**:
| Sport | K Factor | Home Advantage |
|-------|----------|----------------|
| NFL | 20 | 48 points |
| NBA | 20 | 100 points |
| MLB | 4 | 24 points |
| NHL | 8 | 33 points |
| NCAAF | 32 | 70 points |
| NCAAB | 32 | 100 points |

#### 2.2.3 Recency Weighting

**Exponential Decay Formula**:
```
Weight = e^(-λ × days_ago)

λ = ln(2) / half_life_days
```

**Default Half-Lives**:
| Data Type | Half-Life |
|-----------|-----------|
| Team performance | 30 days |
| Player form | 14 days |
| Head-to-head | 365 days |
| Line movement | 1 hour |

### 2.3 Data Leakage Prevention

#### 2.3.1 Temporal Isolation Rules
- All features computed using only data available before game start
- Strict cutoff timestamp enforcement
- No future game outcomes in training data
- Injury status frozen at game time

#### 2.3.2 Train/Test Split Strategy
- **Method**: Walk-forward validation with temporal ordering
- **Training Window**: Rolling 365 days
- **Validation Window**: Rolling 30 days
- **Gap**: 24 hours between training end and test start

#### 2.3.3 Feature Store Versioning
- Point-in-time feature retrieval
- Immutable feature snapshots at prediction time
- Audit trail for all feature calculations

---

## 3. Model Architecture

### 3.1 Meta-Ensemble Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    META-ENSEMBLE LAYER                          │
│        (Learned weights based on validation performance)        │
├─────────────────┬──────────────────┬───────────────────────────┤
│                 │                  │                           │
│  ┌──────────────▼────────────┐  ┌─▼────────────────────────┐  │
│  │      H2O AutoML           │  │       AutoGluon          │  │
│  │    (35% weight)           │  │     (45% weight)         │  │
│  │                           │  │                          │  │
│  │  ┌────────────────────┐   │  │  ┌────────────────────┐  │  │
│  │  │ GBM Ensemble       │   │  │  │ WeightedEnsemble   │  │  │
│  │  │ Deep Learning      │   │  │  │ (Multi-layer       │  │  │
│  │  │ GLM Ensemble       │   │  │  │  stacking)         │  │  │
│  │  │ XGBoost           │   │  │  │                    │  │  │
│  │  │ Stacked Ensemble   │   │  │  │ L1: LightGBM      │  │  │
│  │  └────────────────────┘   │  │  │ L1: CatBoost      │  │  │
│  │                           │  │  │ L1: XGBoost       │  │  │
│  └───────────────────────────┘  │  │ L1: RandomForest  │  │  │
│                                  │  │ L1: ExtraTrees    │  │  │
│  ┌───────────────────────────┐  │  │ L1: NeuralNet     │  │  │
│  │    Sklearn Ensemble       │  │  │ L2: Stacked GBM   │  │  │
│  │    (20% weight)           │  │  └────────────────────┘  │  │
│  │                           │  │                          │  │
│  │  ┌────────────────────┐   │  └──────────────────────────┘  │
│  │  │ Voting Classifier   │   │                               │
│  │  │ - XGBoost          │   │                               │
│  │  │ - LightGBM         │   │                               │
│  │  │ - CatBoost         │   │                               │
│  │  │ - Random Forest    │   │                               │
│  │  │ - Logistic Reg     │   │                               │
│  │  └────────────────────┘   │                               │
│  └───────────────────────────┘                               │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│              PROBABILITY CALIBRATION LAYER                    │
│         (Isotonic Regression / Platt Scaling)                 │
├───────────────────────────────────────────────────────────────┤
│                    FEATURE STORE                              │
│              (60-168 features per sport)                      │
└───────────────────────────────────────────────────────────────┘
```

### 3.2 H2O AutoML Configuration

**Training Parameters**:
| Parameter | Value | Description |
|-----------|-------|-------------|
| max_models | 50 | Maximum models to train |
| max_runtime_secs | 3600 | Maximum training time |
| stopping_metric | AUC | Early stopping metric |
| stopping_rounds | 3 | Rounds without improvement |
| stopping_tolerance | 0.001 | Minimum improvement |
| nfolds | 5 | Cross-validation folds |
| balance_classes | True | Handle class imbalance |
| seed | 42 | Reproducibility seed |

**Included Algorithms**:
- Gradient Boosting Machine (GBM)
- Distributed Random Forest (DRF)
- Extremely Randomized Trees (XRT)
- Generalized Linear Model (GLM)
- Deep Learning (Neural Network)
- XGBoost
- Stacked Ensemble

### 3.3 AutoGluon Configuration

**Training Parameters**:
| Parameter | Value | Description |
|-----------|-------|-------------|
| preset | best_quality | Maximum accuracy focus |
| time_limit | 3600 | Maximum training time |
| num_bag_folds | 8 | Bagging folds |
| num_stack_levels | 3 | Stacking depth |
| auto_stack | True | Automatic stacking |
| verbosity | 2 | Logging level |

**Multi-Layer Stack Architecture**:
- **Layer 1 (Base)**: LightGBM, CatBoost, XGBoost, Random Forest, Extra Trees, Neural Network, K-Nearest Neighbors
- **Layer 2 (Stack)**: LightGBM, CatBoost on L1 predictions + original features
- **Layer 3 (Final)**: Weighted ensemble of all models

### 3.4 Sklearn Ensemble Configuration

**Voting Classifier Components**:
| Model | Weight | Key Parameters |
|-------|--------|----------------|
| XGBoost | 0.30 | n_estimators=500, max_depth=6, learning_rate=0.05 |
| LightGBM | 0.25 | n_estimators=500, num_leaves=31, learning_rate=0.05 |
| CatBoost | 0.25 | iterations=500, depth=6, learning_rate=0.05 |
| Random Forest | 0.10 | n_estimators=500, max_depth=12 |
| Logistic Regression | 0.10 | C=1.0, max_iter=1000 |

### 3.5 Meta-Weight Calculation

**Validation-Based Weighting**:
```
For each framework f:
    weight_f = (AUC_f - 0.50) / sum((AUC_all - 0.50))
    
Final: normalized to sum to 1.0
```

**Dynamic Weight Adjustment**:
- Weights recalculated weekly based on recent performance
- Minimum weight threshold: 0.10 (no framework below 10%)
- Maximum weight threshold: 0.60 (no framework above 60%)

---

## 4. Training Pipeline

### 4.1 Data Selection and Sampling

**Training Data Requirements**:
| Sport | Minimum Samples | Optimal Samples | Seasons Needed |
|-------|-----------------|-----------------|----------------|
| NFL | 2,000 | 4,000 | 8 seasons |
| NBA | 5,000 | 15,000 | 6 seasons |
| MLB | 10,000 | 30,000 | 5 seasons |
| NHL | 4,000 | 12,000 | 6 seasons |
| NCAAF | 4,000 | 10,000 | 8 seasons |
| NCAAB | 15,000 | 50,000 | 6 seasons |

**Sampling Strategy**:
- Stratified sampling by outcome class
- Temporal stratification to ensure season representation
- Exclusion of COVID-affected seasons (2020-2021 partial)

### 4.2 Class Imbalance Handling

**Methods Applied**:
| Method | When Used | Implementation |
|--------|-----------|----------------|
| Class weights | Always | Inverse frequency weighting |
| SMOTE | Low imbalance (<40%) | Synthetic minority oversampling |
| Undersampling | High imbalance (<30%) | Random majority undersampling |
| Threshold adjustment | Post-training | Optimize F1 or custom metric |

### 4.3 Hyperparameter Optimization

**Search Strategy**: Bayesian Optimization with TPE (Tree-structured Parzen Estimator)

**Search Spaces** (Example for XGBoost):
| Parameter | Range | Distribution |
|-----------|-------|--------------|
| n_estimators | 100-1000 | Log-uniform |
| max_depth | 3-12 | Integer uniform |
| learning_rate | 0.01-0.3 | Log-uniform |
| min_child_weight | 1-10 | Integer uniform |
| subsample | 0.6-1.0 | Uniform |
| colsample_bytree | 0.6-1.0 | Uniform |
| gamma | 0-5 | Uniform |
| reg_alpha | 0-10 | Log-uniform |
| reg_lambda | 0-10 | Log-uniform |

**Optimization Budget**: 100 trials per model type

### 4.4 Model Versioning and Lineage

**Version Naming Convention**: `{sport}_{bet_type}_v{major}.{minor}.{patch}_{timestamp}`

**Example**: `nfl_spread_v2.1.0_20260102T140000Z`

**Metadata Tracked**:
- Training data date range
- Feature set version
- Hyperparameters
- Validation metrics
- Training duration
- Parent model (if retrained)
- Promotion history

---

## 5. Evaluation and Validation

### 5.1 Walk-Forward Validation

**Configuration**:
| Parameter | Value |
|-----------|-------|
| Training window | 365 days |
| Validation window | 30 days |
| Step size | 30 days |
| Minimum training size | 180 days |
| Total folds | 12 (1 year validation) |

**Process**:
1. Initialize training window (e.g., Jan 1, 2024 - Dec 31, 2024)
2. Validate on next 30 days (Jan 1-30, 2025)
3. Record metrics
4. Slide window forward 30 days
5. Repeat until end of data

### 5.2 Evaluation Metrics

**Classification Metrics**:
| Metric | Target | Description |
|--------|--------|-------------|
| Accuracy | > 55% overall, > 65% Tier A | Correct predictions / Total |
| AUC-ROC | > 0.60 | Area under ROC curve |
| Log Loss | < 0.68 | Cross-entropy loss |
| Brier Score | < 0.24 | Mean squared probability error |
| F1 Score | > 0.55 | Harmonic mean of precision/recall |

**Calibration Metrics**:
| Metric | Target | Description |
|--------|--------|-------------|
| Expected Calibration Error (ECE) | < 0.05 | Weighted average calibration gap |
| Maximum Calibration Error (MCE) | < 0.15 | Worst bin calibration gap |
| Calibration slope | 0.95-1.05 | Reliability diagram slope |

**Betting-Specific Metrics**:
| Metric | Target | Description |
|--------|--------|-------------|
| CLV (Closing Line Value) | > +1% | Edge vs closing line |
| ROI | > +3% | Return on investment |
| Sharpe Ratio | > 0.5 | Risk-adjusted return |
| Win Rate by Tier | Tier A > 65%, Tier B > 60% | Tier-specific accuracy |

### 5.3 Backtesting Framework

**Backtesting Parameters**:
- Start date: 5 years ago
- End date: Present
- Bet sizing: Quarter Kelly (25%)
- Maximum bet: 2% of bankroll
- Minimum edge: 3%
- Starting bankroll: 10,000 units

**Output Reports**:
- Cumulative P&L chart
- ROI by sport and bet type
- Monthly performance breakdown
- Drawdown analysis
- Win streak distribution
- Edge vs actual win rate correlation

### 5.4 Out-of-Time Validation

**Holdout Strategy**:
- Final 3 months of data reserved
- Never used in training or hyperparameter tuning
- Final model validation only
- Results must match walk-forward performance

---

## 6. Model Serving

### 6.1 Online vs Batch Predictions

| Mode | Use Case | Latency Target | Update Frequency |
|------|----------|----------------|------------------|
| Batch | Pre-game predictions | < 5 minutes | Hourly |
| Online | Real-time odds updates | < 500ms | On-demand |
| Near-real-time | Edge recalculation | < 2 seconds | Every 60 seconds |

### 6.2 Inference Pipeline

**Steps**:
1. Receive prediction request (game_id, bet_type)
2. Retrieve features from feature store (point-in-time)
3. Load production model artifacts
4. Run H2O MOJO inference
5. Run AutoGluon inference
6. Run Sklearn inference
7. Combine with meta-weights
8. Apply probability calibration
9. Calculate edge vs current odds
10. Apply Kelly sizing
11. Generate SHAP explanations
12. Return prediction response

### 6.3 Caching Strategy

**Cache Layers**:
| Layer | Data | TTL | Technology |
|-------|------|-----|------------|
| L1 | Model artifacts | 24 hours | In-memory |
| L2 | Feature vectors | 1 hour | Redis |
| L3 | Predictions | 5 minutes | Redis |
| L4 | SHAP values | 1 hour | Redis |

### 6.4 Fallback Mechanisms

**Fallback Hierarchy**:
1. Primary: Full meta-ensemble
2. Secondary: AutoGluon only (if H2O fails)
3. Tertiary: Sklearn only (if AutoGluon fails)
4. Emergency: Historical baseline (no prediction if all fail)

**Circuit Breaker Configuration**:
- Failure threshold: 5 consecutive failures
- Open duration: 60 seconds
- Half-open test: 1 request
- Monitoring: Per-model health checks

---

## 7. Probability Calibration

### 7.1 Calibration Methods

**Isotonic Regression** (Default):
- Non-parametric monotonic transformation
- Best for well-ordered predictions
- Applied per bet type per sport

**Platt Scaling**:
- Logistic regression on predictions
- Used as backup for small calibration sets
- Single-parameter (temperature) variant available

**Temperature Scaling**:
- Single learned temperature parameter
- Divides logits by temperature
- Fast inference, minimal overhead

### 7.2 Calibration Training

**Calibration Set**:
- 20% of validation data held out
- Separate from model training
- Updated monthly with new data

**Calibration Metrics**:
- ECE computed on 10 equally-spaced bins
- Reliability diagram visual inspection
- Brier score decomposition (calibration + refinement)

### 7.3 Calibration Validation

**Acceptance Criteria**:
- ECE < 0.05 for production deployment
- No bin with > 0.10 calibration error
- Monotonic relationship between predicted and actual

---

## 8. Model Monitoring

### 8.1 Performance Monitoring

**Tracked Metrics**:
| Metric | Granularity | Alert Threshold |
|--------|-------------|-----------------|
| Accuracy | Daily per sport | < 52% (7-day rolling) |
| AUC | Daily per sport | < 0.55 (7-day rolling) |
| Log Loss | Daily per sport | > 0.72 (7-day rolling) |
| CLV | Daily per sport | < 0% (14-day rolling) |
| Prediction Latency | Per request | > 2 seconds |

### 8.2 Drift Detection

**Feature Drift**:
- Population Stability Index (PSI) per feature
- Alert threshold: PSI > 0.20
- Monitoring frequency: Daily

**Prediction Drift**:
- Kolmogorov-Smirnov test on prediction distributions
- Alert threshold: p-value < 0.01
- Comparison: Current week vs historical baseline

**Concept Drift**:
- Accuracy decay over time
- Trigger retraining if accuracy drops > 5%
- Rolling window comparison (30 days)

### 8.3 Retraining Triggers

**Automatic Retraining**:
| Trigger | Condition | Action |
|---------|-----------|--------|
| Scheduled | Weekly (Mondays 4 AM UTC) | Full retrain all sports |
| Performance | Accuracy drop > 5% | Sport-specific retrain |
| Drift | PSI > 0.25 any feature | Feature investigation + retrain |
| Data | New season start | Full retrain with new data |

**Retraining Pipeline**:
1. Fetch latest training data
2. Run full training pipeline
3. Validate on holdout set
4. Compare to champion model
5. Auto-promote if challenger wins
6. Alert if challenger significantly worse

---

*End of ML Pipeline Document*
