# 26 - SIGNAL TIER MATHEMATICAL SPECIFICATION

## AI PRO SPORTS - Complete Mathematical Framework

---

## Table of Contents

1. Signal Tier System
2. Probability Calculations
3. Kelly Criterion Mathematics
4. ELO Rating System
5. CLV Calculations
6. Expected Value Formulas
7. Calibration Mathematics
8. Edge Calculations
9. Bankroll Mathematics
10. Statistical Confidence

---

## 1. Signal Tier System

### 1.1 Tier Classification Function

```
T(p) = {
    'A'  if p ≥ 0.65
    'B'  if 0.60 ≤ p < 0.65
    'C'  if 0.55 ≤ p < 0.60
    'D'  if p < 0.55
}

Where: p = calibrated probability of prediction
```

### 1.2 Tier Thresholds

| Tier | Probability Range | Implied Edge | Min Sample |
|------|-------------------|--------------|------------|
| A | [0.65, 1.00] | ≥ 8.5% | 50 |
| B | [0.60, 0.65) | 5-8.5% | 75 |
| C | [0.55, 0.60) | 2-5% | 100 |
| D | [0.00, 0.55) | < 2% | N/A |

### 1.3 Confidence Interval for Tier Assignment

```
CI = p ± z × √(p(1-p)/n)

Where:
  p = observed win rate
  n = sample size
  z = 1.96 (95% confidence)
```

**Tier Verification Requirement:**

Lower bound of 95% CI must exceed tier minimum threshold.

---

## 2. Probability Calculations

### 2.1 American Odds to Implied Probability

```
For positive odds (+150):
  P(implied) = 100 / (odds + 100)
  P(implied) = 100 / (150 + 100) = 0.40 (40%)

For negative odds (-150):
  P(implied) = |odds| / (|odds| + 100)
  P(implied) = 150 / (150 + 100) = 0.60 (60%)
```

### 2.2 Decimal Odds Conversion

```
American to Decimal:
  If odds > 0: decimal = (odds / 100) + 1
  If odds < 0: decimal = (100 / |odds|) + 1

Decimal to Implied Probability:
  P(implied) = 1 / decimal_odds
```

### 2.3 No-Vig Probability Calculation

```
P(no_vig) = P(raw) / (P(home_raw) + P(away_raw))

Example:
  Home: -150 → P(raw) = 0.60
  Away: +130 → P(raw) = 0.435
  Total = 1.035 (3.5% vig)
  
  P(home_no_vig) = 0.60 / 1.035 = 0.580
  P(away_no_vig) = 0.435 / 1.035 = 0.420
```

### 2.4 Ensemble Probability Combination

```
P(ensemble) = Σ(w_i × P_i) / Σ(w_i)

Where:
  w_i = weight of model i
  P_i = probability from model i

Default Weights:
  w_H2O = 0.35
  w_AutoGluon = 0.45
  w_Sklearn = 0.20

P(final) = (0.35 × P_H2O) + (0.45 × P_AG) + (0.20 × P_SK)
```

---

## 3. Kelly Criterion Mathematics

### 3.1 Full Kelly Formula

```
f* = (bp - q) / b

Where:
  f* = fraction of bankroll to bet
  b = decimal odds - 1 (net odds)
  p = probability of winning
  q = 1 - p (probability of losing)
```

### 3.2 Example Calculation

```
Given:
  Our probability: p = 0.60 (60%)
  American odds: -110
  Decimal odds: 1.909
  b = 1.909 - 1 = 0.909
  q = 0.40

f* = (0.909 × 0.60 - 0.40) / 0.909
f* = (0.5454 - 0.40) / 0.909
f* = 0.1454 / 0.909
f* = 0.16 (16% of bankroll)
```

### 3.3 Fractional Kelly

```
f(fractional) = f* × k

Where:
  k = Kelly fraction (default: 0.25)
  
System uses 25% Kelly:
  f(bet) = f* × 0.25
  
From example: 0.16 × 0.25 = 0.04 (4% of bankroll)
```

### 3.4 Kelly with Maximum Cap

```
f(final) = min(f(fractional), f(max))

Where:
  f(max) = 0.02 (2% maximum bet)
  
From example: min(0.04, 0.02) = 0.02 (2% of bankroll)
```

### 3.5 Edge Threshold Check

```
Bet only if Edge > Edge(min)

Edge = p - P(implied)
Edge(min) = 0.03 (3%)

Example:
  p = 0.60
  P(implied) = 0.524 (from -110 odds)
  Edge = 0.60 - 0.524 = 0.076 (7.6%) ✓ > 3%
```

---

## 4. ELO Rating System

### 4.1 Expected Score Calculation

```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))
E_B = 1 / (1 + 10^((R_A - R_B) / 400))

Where:
  R_A = ELO rating of team A
  R_B = ELO rating of team B
  E_A = expected score for team A (0 to 1)
```

### 4.2 Rating Update Formula

```
R'_A = R_A + K × (S_A - E_A)

Where:
  R'_A = new rating
  R_A = old rating
  K = K-factor (sport-specific)
  S_A = actual score (1 for win, 0.5 for tie, 0 for loss)
  E_A = expected score
```

### 4.3 Sport-Specific K-Factors

| Sport | K-Factor | Rationale |
|-------|----------|-----------|
| NFL | 32 | High variance, fewer games |
| NBA | 20 | Less variance, many games |
| MLB | 8 | Very low variance, 162 games |
| NHL | 16 | Moderate variance |
| NCAAF | 36 | High variance, talent gaps |
| NCAAB | 24 | March Madness volatility |
| CFL | 28 | Smaller league |
| WNBA | 24 | Shorter season |
| ATP/WTA | 40 | Individual sport, high variance |

### 4.4 Margin of Victory Adjustment

```
K_adj = K × MOV_multiplier

MOV_multiplier = ln(|point_diff| + 1) × (2.2 / ((R_winner - R_loser) × 0.001 + 2.2))

This prevents:
- Excessive rating changes from blowouts
- Inflation when strong beats weak
```

### 4.5 Home Court Advantage

```
E_A(home) = 1 / (1 + 10^((R_B - R_A - HCA) / 400))

HCA (Home Court Advantage):
  NBA: 100 points (~3.5 points)
  NFL: 65 points (~2.5 points)
  MLB: 24 points (~1.0 points)
  NHL: 40 points (~0.5 goals)
```

---

## 5. CLV Calculations

### 5.1 Spread CLV (Points)

```
CLV_points = Closing_spread - Bet_spread (for favorites)
CLV_points = Bet_spread - Closing_spread (for underdogs)

Example (betting favorite):
  Bet at: -3.5
  Closed at: -4.5
  CLV = -4.5 - (-3.5) = -1.0 point (1 point of value captured)
```

### 5.2 Moneyline CLV (Percentage)

```
CLV% = (P_bet - P_close) / P_close × 100

Where:
  P_bet = implied probability at bet time (no-vig)
  P_close = implied probability at close (no-vig)

Example:
  Bet at -150: P_bet = 0.60
  Closed at -180: P_close = 0.643
  CLV% = (0.60 - 0.643) / 0.643 × 100 = -6.7% (negative CLV)
```

### 5.3 Total CLV

```
CLV_points = Closing_total - Bet_total (for over)
CLV_points = Bet_total - Closing_total (for under)

Example (betting over):
  Bet over: 210.5
  Closed at: 212.5
  CLV = 212.5 - 210.5 = 2.0 points of value
```

### 5.4 Aggregate CLV

```
CLV_avg = Σ(CLV_i) / n

Where n = number of bets

Weighted CLV (by stake):
CLV_weighted = Σ(CLV_i × stake_i) / Σ(stake_i)
```

---

## 6. Expected Value Formulas

### 6.1 Expected Value (EV)

```
EV = (P × W) - ((1 - P) × L)

Where:
  P = probability of winning
  W = potential profit if win
  L = stake if lose

Example:
  P = 0.60, Stake = $100, Odds = -110
  W = $90.91 (if win)
  L = $100 (if lose)
  EV = (0.60 × 90.91) - (0.40 × 100)
  EV = 54.55 - 40 = $14.55
```

### 6.2 EV as Percentage

```
EV% = ((P × decimal_odds) - 1) × 100

Example:
  P = 0.60, decimal_odds = 1.909
  EV% = (0.60 × 1.909 - 1) × 100
  EV% = (1.145 - 1) × 100 = 14.5%
```

### 6.3 ROI Calculation

```
ROI = (Total_Profit / Total_Wagered) × 100

Example:
  Total wagered: $10,000
  Total returned: $10,500
  Total profit: $500
  ROI = (500 / 10000) × 100 = 5%
```

---

## 7. Calibration Mathematics

### 7.1 Expected Calibration Error (ECE)

```
ECE = Σ_b (n_b / N) × |accuracy(b) - confidence(b)|

Where:
  b = probability bin
  n_b = samples in bin
  N = total samples
  accuracy(b) = actual win rate in bin
  confidence(b) = average predicted probability in bin
```

### 7.2 Brier Score

```
BS = (1/N) × Σ(p_i - o_i)²

Where:
  p_i = predicted probability
  o_i = actual outcome (1 or 0)
  
Perfect: BS = 0
No skill: BS = 0.25
```

### 7.3 Isotonic Regression Calibration

```
Transform raw probabilities using monotonic function:
  p_calibrated = f(p_raw)
  
Where f is a step function fitted to minimize:
  Σ(f(p_i) - o_i)²
  
Subject to: f is monotonically increasing
```

### 7.4 Platt Scaling

```
p_calibrated = 1 / (1 + exp(A × p_raw + B))

Where A, B are learned parameters that minimize log loss:
  L = -Σ[o_i × log(p_cal_i) + (1-o_i) × log(1-p_cal_i)]
```

---

## 8. Edge Calculations

### 8.1 Raw Edge

```
Edge = P_model - P_market

Where:
  P_model = our predicted probability
  P_market = implied probability from odds
```

### 8.2 No-Vig Edge

```
Edge_nv = P_model - P_market_nv

Where P_market_nv is calculated removing vig:
  P_market_nv = P_raw / (P_home_raw + P_away_raw)
```

### 8.3 Edge Quality Score

```
EQS = Edge × √(sample_size) / σ_edge

Where:
  σ_edge = standard deviation of edges
  
Higher EQS = more reliable edge
```

### 8.4 Minimum Edge Threshold

```
Edge_min = vig% / 2 + buffer

For standard -110/-110 line:
  vig = 4.5%
  Edge_min = 4.5/2 + 1.0 = 3.25% (rounded to 3%)
```

---

## 9. Bankroll Mathematics

### 9.1 Bet Sizing Formula

```
Bet_amount = Bankroll × min(f_kelly × fraction, max_bet)

Where:
  f_kelly = Kelly criterion result
  fraction = 0.25 (quarter Kelly)
  max_bet = 0.02 (2% cap)
```

### 9.2 Compound Growth

```
Bankroll_t = Bankroll_0 × (1 + r)^n

Where:
  r = average return per bet
  n = number of bets
```

### 9.3 Drawdown Calculation

```
Drawdown = (Peak - Current) / Peak × 100

Max_Drawdown = max(Drawdown_i) for all i
```

### 9.4 Risk of Ruin

```
RoR = ((1 - edge) / (1 + edge))^(bankroll_units)

Where:
  edge = expected edge per bet
  bankroll_units = bankroll / bet_size

Example:
  Edge = 3%, bet_size = 2% of bankroll
  Bankroll_units = 100/2 = 50
  RoR = (0.97/1.03)^50 = 0.045 (4.5% risk of ruin)
```

---

## 10. Statistical Confidence

### 10.1 Required Sample Size

```
n = (z² × p × (1-p)) / E²

Where:
  z = z-score (1.96 for 95% CI)
  p = expected proportion
  E = margin of error

For 55% accuracy ± 3%:
  n = (1.96² × 0.55 × 0.45) / 0.03²
  n = (3.84 × 0.2475) / 0.0009
  n ≈ 1,056 bets
```

### 10.2 Statistical Significance Test

```
z = (p_observed - p_expected) / √(p_expected × (1-p_expected) / n)

If |z| > 1.96, result is significant at 95% level
```

### 10.3 Confidence Interval for Win Rate

```
CI = p ± z × √(p(1-p)/n)

Example (100 bets, 58% win rate):
  CI = 0.58 ± 1.96 × √(0.58 × 0.42 / 100)
  CI = 0.58 ± 0.097
  CI = [0.483, 0.677] or 48.3% to 67.7%
```

### 10.4 Variance Calculation

```
Variance = p × (1-p) × stake²

For -110 bets (stake = 1.1 units to win 1):
  Variance = 0.55 × 0.45 × 1.1² = 0.299 units²
  Std Dev = √0.299 = 0.547 units per bet
```

---

## Formula Quick Reference

| Calculation | Formula |
|-------------|---------|
| Kelly | f* = (bp - q) / b |
| ELO Expected | E = 1 / (1 + 10^((R_B - R_A)/400)) |
| ELO Update | R' = R + K × (S - E) |
| CLV Spread | Closing - Bet (favorites) |
| Expected Value | EV = (P × W) - ((1-P) × L) |
| Brier Score | BS = (1/N) × Σ(p - o)² |
| Edge | P_model - P_market |
| No-Vig Prob | P / (P_home + P_away) |
| ROI | (Profit / Wagered) × 100 |

---

**Specification Version:** 2.0  
**Last Updated:** January 2026
