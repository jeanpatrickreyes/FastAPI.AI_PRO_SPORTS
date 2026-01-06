# 10 - CLV TRACKING GUIDE

## AI PRO SPORTS - Closing Line Value Analysis

---

## Table of Contents

1. What is CLV?
2. Why CLV Matters
3. CLV Calculation Methods
4. Pinnacle Benchmark
5. CLV Performance Tiers
6. Tracking Implementation
7. CLV Analysis & Reporting
8. Improving CLV
9. Common Pitfalls

---

## 1. What is CLV?

**Closing Line Value (CLV)** measures the difference between the odds at which you placed your bet and the closing line (final odds before the game starts).

### The Core Concept

- **Opening Line:** First odds released by sportsbooks
- **Your Bet Line:** Odds when you placed your bet
- **Closing Line:** Final odds before game starts

**CLV Formula:**
```
CLV = (Your_Implied_Prob - Closing_Implied_Prob) / Closing_Implied_Prob × 100
```

### Example

```
You bet Lakers -3.5 at -110 (52.38% implied)
Closing line: Lakers -4.5 at -110 (52.38% implied for -4.5)

Since you got a better number (-3.5 vs -4.5):
Your effective closing implied prob would be higher

Adjusted calculation shows positive CLV = +2.1%
```

---

## 2. Why CLV Matters

### The Best Predictor of Long-Term Success

CLV is considered the **single best predictor** of long-term sports betting profitability because:

1. **Market Efficiency:** Closing lines represent the market's best estimate of true probability
2. **Sharp Money:** By close, sharp bettors have moved the line to its "correct" position
3. **Removes Variance:** Unlike win/loss records, CLV removes short-term luck
4. **Early Signal:** CLV shows if you're beating the market before results confirm

### CLV vs Win Rate

| Metric | Short-Term | Long-Term | Predictive Power |
|--------|------------|-----------|------------------|
| Win Rate | High variance | Converges | Low |
| CLV | Stable | Consistent | High |

**Key Insight:** A bettor with 50% win rate but +2% CLV will be profitable long-term. A bettor with 55% win rate but -1% CLV will eventually lose.

---

## 3. CLV Calculation Methods

### Method 1: Point Spread CLV

For spread bets, calculate the value of points gained or lost:

```python
def calculate_spread_clv(bet_spread, closing_spread, bet_side):
    """
    Calculate CLV for spread bets.
    
    Args:
        bet_spread: Spread when bet was placed (e.g., -3.5)
        closing_spread: Closing spread (e.g., -4.5)
        bet_side: 'favorite' or 'underdog'
    
    Returns:
        CLV in points (positive = value captured)
    """
    if bet_side == 'favorite':
        # Betting favorite: smaller spread is better
        clv_points = closing_spread - bet_spread
    else:
        # Betting underdog: larger spread is better
        clv_points = bet_spread - closing_spread
    
    return clv_points

# Example: Bet favorite at -3.5, closed at -4.5
clv = calculate_spread_clv(-3.5, -4.5, 'favorite')
# Returns: 1.0 point of CLV
```

### Method 2: Moneyline CLV (No-Vig)

For moneyline bets, convert to no-vig probabilities:

```python
def calculate_moneyline_clv(bet_odds, closing_home_odds, closing_away_odds, bet_side):
    """
    Calculate CLV for moneyline bets using no-vig probabilities.
    """
    # Convert to implied probabilities
    bet_implied = american_to_implied(bet_odds)
    
    # Calculate no-vig closing probabilities
    close_home_implied = american_to_implied(closing_home_odds)
    close_away_implied = american_to_implied(closing_away_odds)
    total_implied = close_home_implied + close_away_implied
    
    if bet_side == 'home':
        close_no_vig = close_home_implied / total_implied
    else:
        close_no_vig = close_away_implied / total_implied
    
    # CLV percentage
    clv = (bet_implied - close_no_vig) / close_no_vig * 100
    
    return clv

def american_to_implied(odds):
    """Convert American odds to implied probability."""
    if odds > 0:
        return 100 / (odds + 100)
    else:
        return abs(odds) / (abs(odds) + 100)
```

### Method 3: Total CLV

For over/under bets:

```python
def calculate_total_clv(bet_total, closing_total, bet_side):
    """
    Calculate CLV for total (over/under) bets.
    """
    if bet_side == 'over':
        # Over: higher closing total = CLV
        clv_points = closing_total - bet_total
    else:
        # Under: lower closing total = CLV
        clv_points = bet_total - closing_total
    
    return clv_points
```

---

## 4. Pinnacle Benchmark

### Why Pinnacle?

AI PRO SPORTS uses **Pinnacle** as the benchmark for CLV calculation because:

| Factor | Pinnacle | Other Books |
|--------|----------|-------------|
| Vig | 1.5-3% | 4.5-10% |
| Limits | $50K+ | $500-5K |
| Sharp Action | Welcomes | Limits/Bans |
| Line Movement | Market-driven | Copy Pinnacle |
| Accuracy | Highest | Lower |

### The Sharp Market Theory

1. Pinnacle accepts large bets from professional bettors
2. Sharp money moves Pinnacle's lines
3. Other books follow Pinnacle
4. Pinnacle's closing line = best market estimate

### Pinnacle Data Collection

```python
PINNACLE_CONFIG = {
    'sportsbook_key': 'pinnacle',
    'priority': 1,  # Highest priority for closing lines
    'is_sharp': True,
    'collection_interval': 60,  # Every 60 seconds
    'closing_window': 5,  # Minutes before game start
}

async def get_pinnacle_closing_line(game_id: str, market: str):
    """
    Retrieve Pinnacle's closing line for a game.
    """
    closing_snapshot = await db.query(
        """
        SELECT * FROM line_snapshots
        WHERE game_id = :game_id
        AND sportsbook = 'pinnacle'
        AND market = :market
        AND snapshot_time = (
            SELECT MAX(snapshot_time) 
            FROM line_snapshots 
            WHERE game_id = :game_id 
            AND snapshot_time < game_start_time
        )
        """
    )
    return closing_snapshot
```

---

## 5. CLV Performance Tiers

### CLV Classification

| Tier | CLV Range | Classification | Action |
|------|-----------|----------------|--------|
| **Elite** | +3.0% or better | Top-tier sharp | Scale up aggressively |
| **Professional** | +2.0% to +3.0% | Professional-grade | Scale up |
| **Competent** | +1.0% to +2.0% | Solid edge | Maintain strategy |
| **Break-even** | 0% to +1.0% | Marginal edge | Review & improve |
| **Negative** | Below 0% | Losing to market | Immediate review |

### Expected ROI by CLV

| CLV | Expected Annual ROI |
|-----|---------------------|
| +3% | 6-10% |
| +2% | 4-6% |
| +1% | 2-3% |
| 0% | Break-even |
| -1% | -2 to -3% |

### Sample Size Requirements

| Confidence Level | Required Bets |
|------------------|---------------|
| Preliminary | 100 bets |
| Moderate | 500 bets |
| High | 1,000 bets |
| Very High | 2,500+ bets |

---

## 6. Tracking Implementation

### Database Schema

```sql
-- CLV tracking table
CREATE TABLE clv_records (
    id SERIAL PRIMARY KEY,
    prediction_id INTEGER REFERENCES predictions(id),
    bet_id INTEGER REFERENCES bets(id),
    
    -- Bet details
    sport_code VARCHAR(10),
    market VARCHAR(20),  -- spread, moneyline, total
    bet_side VARCHAR(20),
    bet_line DECIMAL(6,2),
    bet_odds INTEGER,
    
    -- Closing line details
    closing_line DECIMAL(6,2),
    closing_odds INTEGER,
    closing_source VARCHAR(50) DEFAULT 'pinnacle',
    
    -- CLV calculations
    clv_points DECIMAL(6,3),
    clv_percentage DECIMAL(6,4),
    
    -- Metadata
    bet_timestamp TIMESTAMP,
    closing_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_clv_sport ON clv_records(sport_code);
CREATE INDEX idx_clv_date ON clv_records(bet_timestamp);
CREATE INDEX idx_clv_market ON clv_records(market);
```

### CLV Calculation Service

```python
class CLVTracker:
    def __init__(self, db_session):
        self.db = db_session
    
    async def calculate_and_store_clv(self, bet_id: int):
        """Calculate CLV for a bet after game starts."""
        
        # Get bet details
        bet = await self.db.get(Bet, bet_id)
        
        # Get closing line from Pinnacle
        closing = await self.get_pinnacle_closing(
            bet.game_id, 
            bet.market
        )
        
        if not closing:
            return None
        
        # Calculate CLV based on market type
        if bet.market == 'spread':
            clv_points = self.calc_spread_clv(
                bet.line, closing.line, bet.side
            )
            clv_pct = clv_points * 0.5  # ~0.5% per point
            
        elif bet.market == 'moneyline':
            clv_pct = self.calc_ml_clv(
                bet.odds, closing.home_odds, 
                closing.away_odds, bet.side
            )
            clv_points = None
            
        elif bet.market == 'total':
            clv_points = self.calc_total_clv(
                bet.line, closing.line, bet.side
            )
            clv_pct = clv_points * 0.4  # ~0.4% per point
        
        # Store CLV record
        clv_record = CLVRecord(
            bet_id=bet_id,
            sport_code=bet.sport_code,
            market=bet.market,
            bet_side=bet.side,
            bet_line=bet.line,
            bet_odds=bet.odds,
            closing_line=closing.line,
            closing_odds=closing.odds,
            clv_points=clv_points,
            clv_percentage=clv_pct,
            bet_timestamp=bet.placed_at,
            closing_timestamp=closing.snapshot_time
        )
        
        self.db.add(clv_record)
        await self.db.commit()
        
        return clv_record
```

---

## 7. CLV Analysis & Reporting

### Daily CLV Report

```python
async def generate_daily_clv_report(date: datetime.date):
    """Generate daily CLV performance report."""
    
    report = {
        'date': date,
        'total_bets': 0,
        'average_clv': 0,
        'by_sport': {},
        'by_tier': {},
        'by_market': {}
    }
    
    # Query CLV records for date
    records = await db.query(
        """
        SELECT 
            sport_code,
            market,
            signal_tier,
            COUNT(*) as bet_count,
            AVG(clv_percentage) as avg_clv,
            SUM(CASE WHEN clv_percentage > 0 THEN 1 ELSE 0 END) as positive_clv_count
        FROM clv_records cr
        JOIN predictions p ON cr.prediction_id = p.id
        WHERE DATE(cr.bet_timestamp) = :date
        GROUP BY sport_code, market, signal_tier
        """
    )
    
    # Aggregate results
    for r in records:
        report['total_bets'] += r.bet_count
        
        # By sport
        if r.sport_code not in report['by_sport']:
            report['by_sport'][r.sport_code] = {'bets': 0, 'avg_clv': []}
        report['by_sport'][r.sport_code]['bets'] += r.bet_count
        report['by_sport'][r.sport_code]['avg_clv'].append(r.avg_clv)
        
        # By tier
        if r.signal_tier not in report['by_tier']:
            report['by_tier'][r.signal_tier] = {'bets': 0, 'avg_clv': []}
        report['by_tier'][r.signal_tier]['bets'] += r.bet_count
        report['by_tier'][r.signal_tier]['avg_clv'].append(r.avg_clv)
    
    return report
```

### CLV Dashboard Metrics

| Metric | Query | Target |
|--------|-------|--------|
| Overall CLV | `AVG(clv_percentage)` | > +1.5% |
| Tier A CLV | Filter tier='A' | > +2.5% |
| Win Rate at +CLV | Wins where CLV > 0 | > 53% |
| CLV Consistency | STDDEV(clv_percentage) | < 3% |
| Sharp Line Capture | % bets with CLV > 0 | > 55% |

---

## 8. Improving CLV

### Strategies for Better CLV

1. **Bet Early**
   - Place bets when lines first release
   - Before sharp money moves the line
   - Target off-market games

2. **Use Multiple Sportsbooks**
   - Find the best line across books
   - Arbitrage opportunities
   - Line shopping tools

3. **Track Steam Moves**
   - Identify sharp action early
   - Bet before line moves
   - Monitor line movement alerts

4. **Focus on Inefficient Markets**
   - Player props
   - Smaller leagues (CFL, WNBA)
   - Early-week NFL lines

5. **Improve Model Timing**
   - Generate predictions early
   - Beat the market to information
   - Incorporate injury news quickly

### CLV Optimization Settings

```python
CLV_OPTIMIZATION_CONFIG = {
    'target_clv': 2.0,  # Target 2% CLV
    'min_acceptable_clv': 0.5,  # Minimum to continue betting
    'clv_weight_in_selection': 0.3,  # 30% weight in bet selection
    'early_line_preference': True,
    'steam_move_threshold': 0.5,  # Points of movement
    'line_shopping_enabled': True,
}
```

---

## 9. Common Pitfalls

### Pitfall 1: Small Sample Size

**Problem:** Drawing conclusions from 50-100 bets  
**Solution:** Wait for 500+ bets before major strategy changes

### Pitfall 2: Ignoring Negative CLV

**Problem:** Dismissing negative CLV as "bad luck"  
**Solution:** Negative CLV over 200+ bets = model problem

### Pitfall 3: Cherry-Picking Timeframes

**Problem:** Only looking at winning streaks  
**Solution:** Always analyze full betting history

### Pitfall 4: Wrong Closing Line Source

**Problem:** Using soft book closing lines  
**Solution:** Always use Pinnacle or consensus sharp lines

### Pitfall 5: Not Tracking by Market

**Problem:** Lumping all bet types together  
**Solution:** Separate CLV tracking for spreads, MLs, totals

---

## CLV Monitoring Alerts

```python
CLV_ALERTS = {
    'negative_clv_streak': {
        'threshold': -1.0,  # Average CLV below -1%
        'sample_size': 50,  # Last 50 bets
        'severity': 'WARNING',
        'action': 'Review model performance'
    },
    'clv_degradation': {
        'threshold': -0.5,  # 0.5% drop from baseline
        'period': '7_days',
        'severity': 'WARNING',
        'action': 'Investigate data quality'
    },
    'sport_specific_negative': {
        'threshold': -1.5,
        'sample_size': 30,
        'severity': 'ALERT',
        'action': 'Pause betting on sport, retrain model'
    }
}
```

---

## Summary

| Metric | Target | Action if Below |
|--------|--------|-----------------|
| Overall CLV | > +1.5% | Review models |
| Tier A CLV | > +2.5% | Check calibration |
| CLV Consistency | σ < 3% | Reduce variance |
| Positive CLV % | > 55% | Improve timing |

**CLV is the scorecard that matters most. Track it religiously.**

---

**Guide Version:** 2.0  
**Last Updated:** January 2026
