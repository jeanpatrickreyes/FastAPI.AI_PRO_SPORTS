# NHL MASTER SHEET - ENTERPRISE EDITION
## AI PRO SPORTS | 110 Features | Enterprise-Grade
### Version 3.0 | January 2026

---

## FEATURE CATEGORIES OVERVIEW

| Category | Count | Description |
|----------|-------|-------------|
| Game Info | 8 | Basic game identifiers |
| ELO Ratings | 8 | Power ratings |
| Possession Metrics | 14 | Corsi, Fenwick, xG |
| Goaltending | 12 | Goalie analytics |
| Offensive | 12 | Scoring metrics |
| Defensive | 10 | Defensive metrics |
| Special Teams | 10 | PP/PK analytics |
| Recent Form | 10 | Momentum |
| Rest & Travel | 8 | Fatigue factors |
| Line Movement | 10 | Odds and sharp action |
| Injuries | 4 | Player availability |
| Predictions | 2 | Model outputs |
| Outcomes | 2 | Results and CLV |

**TOTAL: 110 FEATURES**

---

## COMPLETE FEATURE SPECIFICATION

### 1. GAME INFO (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 1 | `game_id` | STRING | Unique game identifier |
| 2 | `game_date` | DATE | Game date (YYYY-MM-DD) |
| 3 | `game_time` | TIME | Puck drop time (ET) |
| 4 | `home_team` | STRING | Home team code |
| 5 | `away_team` | STRING | Away team code |
| 6 | `venue` | STRING | Arena name |
| 7 | `season_type` | STRING | REG/PLAYOFF |
| 8 | `national_tv` | INT | National broadcast (1/0) |

### 2. ELO RATINGS (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 9 | `home_elo` | FLOAT | Home team ELO |
| 10 | `away_elo` | FLOAT | Away team ELO |
| 11 | `elo_diff` | FLOAT | ELO difference |
| 12 | `home_elo_trend` | FLOAT | Home ELO trend |
| 13 | `away_elo_trend` | FLOAT | Away ELO trend |
| 14 | `elo_home_advantage` | FLOAT | ELO home value |
| 15 | `elo_win_prob` | FLOAT | ELO win probability |
| 16 | `elo_puck_line_equiv` | FLOAT | ELO to puck line |

### 3. POSSESSION METRICS (14 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 17 | `home_corsi_pct` | FLOAT | Home CF% |
| 18 | `away_corsi_pct` | FLOAT | Away CF% |
| 19 | `home_fenwick_pct` | FLOAT | Home FF% |
| 20 | `away_fenwick_pct` | FLOAT | Away FF% |
| 21 | `home_xgf_pct` | FLOAT | Home xGF% |
| 22 | `away_xgf_pct` | FLOAT | Away xGF% |
| 23 | `home_xgf_60` | FLOAT | Home xG for/60 |
| 24 | `away_xgf_60` | FLOAT | Away xG for/60 |
| 25 | `home_xga_60` | FLOAT | Home xG against/60 |
| 26 | `away_xga_60` | FLOAT | Away xG against/60 |
| 27 | `home_hdcf_pct` | FLOAT | Home HD chances % |
| 28 | `away_hdcf_pct` | FLOAT | Away HD chances % |
| 29 | `home_pdo` | FLOAT | Home PDO |
| 30 | `away_pdo` | FLOAT | Away PDO |

### 4. GOALTENDING (12 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 31 | `home_goalie` | STRING | Home starter |
| 32 | `away_goalie` | STRING | Away starter |
| 33 | `home_goalie_sv_pct` | FLOAT | Home G save % |
| 34 | `away_goalie_sv_pct` | FLOAT | Away G save % |
| 35 | `home_goalie_gsax` | FLOAT | Home G GSAx |
| 36 | `away_goalie_gsax` | FLOAT | Away G GSAx |
| 37 | `home_goalie_xfsv_pct` | FLOAT | Home G xFSV% |
| 38 | `away_goalie_xfsv_pct` | FLOAT | Away G xFSV% |
| 39 | `home_goalie_hd_sv_pct` | FLOAT | Home G HD save % |
| 40 | `away_goalie_hd_sv_pct` | FLOAT | Away G HD save % |
| 41 | `home_goalie_games_7d` | INT | Home G games/7d |
| 42 | `away_goalie_games_7d` | INT | Away G games/7d |

### 5. OFFENSIVE (12 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 43 | `home_goals_per_game` | FLOAT | Home goals/game |
| 44 | `away_goals_per_game` | FLOAT | Away goals/game |
| 45 | `home_shots_per_game` | FLOAT | Home shots/game |
| 46 | `away_shots_per_game` | FLOAT | Away shots/game |
| 47 | `home_shooting_pct` | FLOAT | Home shooting % |
| 48 | `away_shooting_pct` | FLOAT | Away shooting % |
| 49 | `home_scoring_chances_60` | FLOAT | Home SC/60 |
| 50 | `away_scoring_chances_60` | FLOAT | Away SC/60 |
| 51 | `home_hd_chances_60` | FLOAT | Home HD chances/60 |
| 52 | `away_hd_chances_60` | FLOAT | Away HD chances/60 |
| 53 | `home_rush_attempts_60` | FLOAT | Home rush att/60 |
| 54 | `away_rush_attempts_60` | FLOAT | Away rush att/60 |

### 6. DEFENSIVE (10 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 55 | `home_goals_against_game` | FLOAT | Home GA/game |
| 56 | `away_goals_against_game` | FLOAT | Away GA/game |
| 57 | `home_shots_against_game` | FLOAT | Home SA/game |
| 58 | `away_shots_against_game` | FLOAT | Away SA/game |
| 59 | `home_sc_against_60` | FLOAT | Home SCA/60 |
| 60 | `away_sc_against_60` | FLOAT | Away SCA/60 |
| 61 | `home_hd_against_60` | FLOAT | Home HDCA/60 |
| 62 | `away_hd_against_60` | FLOAT | Away HDCA/60 |
| 63 | `home_blocked_shots` | FLOAT | Home blocks/game |
| 64 | `away_blocked_shots` | FLOAT | Away blocks/game |

### 7. SPECIAL TEAMS (10 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 65 | `home_pp_pct` | FLOAT | Home PP% |
| 66 | `away_pp_pct` | FLOAT | Away PP% |
| 67 | `home_pk_pct` | FLOAT | Home PK% |
| 68 | `away_pk_pct` | FLOAT | Away PK% |
| 69 | `home_pp_xgf_60` | FLOAT | Home PP xG/60 |
| 70 | `away_pp_xgf_60` | FLOAT | Away PP xG/60 |
| 71 | `home_pk_xga_60` | FLOAT | Home PK xGA/60 |
| 72 | `away_pk_xga_60` | FLOAT | Away PK xGA/60 |
| 73 | `home_penalties_game` | FLOAT | Home PIM/game |
| 74 | `away_penalties_game` | FLOAT | Away PIM/game |

### 8. RECENT FORM (10 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 75 | `home_wins_last_10` | INT | Home W last 10 |
| 76 | `away_wins_last_10` | INT | Away W last 10 |
| 77 | `home_points_last_10` | INT | Home pts last 10 |
| 78 | `away_points_last_10` | INT | Away pts last 10 |
| 79 | `home_gf_last_10` | FLOAT | Home GF/G last 10 |
| 80 | `away_gf_last_10` | FLOAT | Away GF/G last 10 |
| 81 | `home_streak` | INT | Home streak |
| 82 | `away_streak` | INT | Away streak |
| 83 | `home_xgf_pct_last_10` | FLOAT | Home xGF% last 10 |
| 84 | `away_xgf_pct_last_10` | FLOAT | Away xGF% last 10 |

### 9. REST & TRAVEL (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 85 | `home_rest_days` | INT | Home days rest |
| 86 | `away_rest_days` | INT | Away days rest |
| 87 | `rest_advantage` | INT | Rest difference |
| 88 | `home_b2b` | INT | Home B2B (1/0) |
| 89 | `away_b2b` | INT | Away B2B (1/0) |
| 90 | `home_games_7d` | INT | Home games/7d |
| 91 | `away_games_7d` | INT | Away games/7d |
| 92 | `away_travel_miles` | INT | Away travel miles |

### 10. LINE MOVEMENT (10 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 93 | `open_puck_line` | FLOAT | Opening puck line |
| 94 | `current_puck_line` | FLOAT | Current puck line |
| 95 | `open_total` | FLOAT | Opening total |
| 96 | `current_total` | FLOAT | Current total |
| 97 | `public_home_pct` | FLOAT | Public on home |
| 98 | `sharp_money_pct` | FLOAT | Sharp money % |
| 99 | `steam_move` | INT | Steam move (1/0) |
| 100 | `reverse_line_move` | INT | RLM (1/0) |
| 101 | `tickets_vs_money` | FLOAT | Ticket/money gap |
| 102 | `pinnacle_ml` | INT | Pinnacle ML |

### 11. INJURIES (4 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 103 | `home_injury_score` | FLOAT | Home injury impact |
| 104 | `away_injury_score` | FLOAT | Away injury impact |
| 105 | `home_star_out` | INT | Home star out (1/0) |
| 106 | `away_star_out` | INT | Away star out (1/0) |

### 12. PREDICTIONS (2 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 107 | `ml_pred_prob` | FLOAT | ML probability |
| 108 | `ml_pred_edge` | FLOAT | ML edge |

### 13. OUTCOMES (2 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 109 | `goal_differential` | INT | Final goal diff |
| 110 | `clv` | FLOAT | Closing line value |

---

## DATA SOURCES

| Source | Features | Update Frequency |
|--------|----------|------------------|
| Evolving Hockey | xG, RAPM, GSAx | Daily |
| Natural Stat Trick | Corsi, Fenwick | Real-time |
| MoneyPuck | xG model | Daily |
| TheOddsAPI | Lines, odds | Real-time |

---

**NHL MASTER SHEET - 110 ENTERPRISE FEATURES**
**AI PRO SPORTS | Version 3.0**
