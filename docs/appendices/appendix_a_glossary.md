# Appendix A: Glossary of Terms

## Betting & Sports Terms

| Term | Definition |
|------|------------|
| **ATS (Against The Spread)** | Betting record considering point spreads, not just wins/losses |
| **Bankroll** | Total amount of money allocated for betting purposes |
| **Closing Line** | Final odds/line at game start; benchmark for measuring prediction quality |
| **CLV (Closing Line Value)** | Difference between odds at bet placement vs closing line; +CLV indicates beating the market |
| **Cover** | Winning a bet against the spread |
| **Edge** | Mathematical advantage over the sportsbook's implied probability |
| **EV (Expected Value)** | Long-term average outcome of a bet; positive EV indicates profitable bet |
| **Favorite** | Team/player expected to win; indicated by negative moneyline |
| **Handle** | Total amount wagered on an event |
| **Hedge** | Placing opposing bets to reduce risk or guarantee profit |
| **Implied Probability** | Win probability derived from betting odds |
| **Juice/Vig** | Sportsbook's commission built into odds; typically 10% (-110) |
| **Line Movement** | Changes in odds/spreads from opening to closing |
| **Moneyline** | Bet on outright winner without point spread |
| **Over/Under (Total)** | Bet on combined score being above or below a set number |
| **Parlay** | Multi-leg bet requiring all selections to win |
| **Point Spread** | Handicap given to underdog to equalize betting |
| **Props (Proposition Bets)** | Bets on specific events within a game (player stats, etc.) |
| **Push** | Bet resulting in tie; stake returned |
| **ROI (Return on Investment)** | Profit/loss as percentage of total wagered |
| **Sharp** | Professional bettor; sharp money moves lines |
| **Square** | Recreational bettor |
| **Steam Move** | Rapid line movement due to large sharp action |
| **Straight Bet** | Single wager on one outcome |
| **Underdog** | Team/player not expected to win; indicated by positive moneyline |
| **Unit** | Standard bet size; typically 1-2% of bankroll |

## ML & Data Science Terms

| Term | Definition |
|------|------------|
| **AUC (Area Under Curve)** | Model performance metric; 0.5 = random, 1.0 = perfect |
| **AutoML** | Automated machine learning for model selection and hyperparameter tuning |
| **Backtesting** | Evaluating strategy on historical data |
| **Brier Score** | Measures accuracy of probabilistic predictions; lower is better |
| **Calibration** | Alignment between predicted probabilities and actual outcomes |
| **Cross-Validation** | Technique for evaluating model by training on subsets of data |
| **Data Leakage** | When future information contaminates training data |
| **Drift** | Change in data distribution or model performance over time |
| **ECE (Expected Calibration Error)** | Measures probability calibration quality |
| **ELO Rating** | Dynamic rating system for ranking teams/players |
| **Ensemble** | Combining multiple models for better predictions |
| **Feature** | Input variable used by ML model |
| **Feature Engineering** | Creating new features from raw data |
| **Feature Store** | Centralized repository for ML features |
| **Gradient Boosting** | Ensemble technique building models sequentially |
| **Hyperparameter** | Model configuration parameter set before training |
| **Inference** | Using trained model to make predictions |
| **Log Loss** | Measures prediction probability accuracy; lower is better |
| **Meta-Ensemble** | Ensemble combining outputs from multiple ML frameworks |
| **Overfitting** | Model performs well on training data but poorly on new data |
| **Precision** | Proportion of positive predictions that were correct |
| **Recall** | Proportion of actual positives correctly identified |
| **SHAP** | SHapley Additive exPlanations; model interpretability method |
| **Stacking** | Ensemble method using meta-model to combine base models |
| **Walk-Forward Validation** | Time-series validation preserving temporal order |

## System & Technical Terms

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface |
| **CDC (Change Data Capture)** | Tracking changes in source data for incremental updates |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **DAG (Directed Acyclic Graph)** | Workflow representation for pipeline orchestration |
| **ETL/ELT** | Extract, Transform, Load / Extract, Load, Transform |
| **gRPC** | High-performance RPC framework |
| **Idempotent** | Operation producing same result regardless of repetition |
| **JWT** | JSON Web Token for authentication |
| **MOJO** | H2O's Model Object for Java/POJO export |
| **OLAP** | Online Analytical Processing (analytics workloads) |
| **OLTP** | Online Transaction Processing (operational workloads) |
| **PSI (Population Stability Index)** | Measures distribution shift in features |
| **REST** | Representational State Transfer (API architecture) |
| **RTO/RPO** | Recovery Time Objective / Recovery Point Objective |
| **SLA** | Service Level Agreement |
| **TTL** | Time To Live (cache expiration) |

## Signal Tier Classifications

| Tier | Confidence | Description | Action |
|------|------------|-------------|--------|
| **Tier A** | 65%+ | Elite predictions, highest edge | Maximum Kelly sizing |
| **Tier B** | 60-65% | Strong value plays | Standard Kelly sizing |
| **Tier C** | 55-60% | Moderate confidence | Reduced sizing |
| **Tier D** | <55% | Lower confidence | Track only, no betting |

## Kelly Criterion Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Full Kelly** | f* = (bp - q) / b | Optimal growth rate formula |
| **Fractional Kelly** | 25% | Risk-adjusted fraction used |
| **Maximum Bet** | 2% | Cap on single bet size |
| **Minimum Edge** | 3% | Threshold for bet consideration |

## Data Quality Rule Codes

| Code Range | Category | Examples |
|------------|----------|----------|
| DQ001-DQ099 | Completeness | Missing fields, null checks |
| DQ101-DQ199 | Accuracy | Range validation, cross-source consistency |
| DQ201-DQ299 | Freshness | Staleness thresholds, update frequency |
| DQ301-DQ399 | Consistency | Referential integrity, business rules |

## Alert Severity Levels

| Level | Response Time | Description | Escalation |
|-------|---------------|-------------|------------|
| **SEV1** | 5 minutes | Critical - service down | Page on-call immediately |
| **SEV2** | 15 minutes | Major - significant degradation | Page on-call |
| **SEV3** | 1 hour | Minor - limited impact | Slack notification |
| **SEV4** | 24 hours | Informational | Email summary |
