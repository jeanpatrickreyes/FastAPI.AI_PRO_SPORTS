# NCAAB MASTER SHEET - ENTERPRISE EDITION
## AI PRO SPORTS | 100 Features | Enterprise-Grade
### Version 3.0 | January 2026

---

## FEATURE CATEGORIES OVERVIEW

| Category | Count | Description |
|----------|-------|-------------|
| Game Info | 8 | Basic identifiers |
| ELO/Ratings | 10 | KenPom, BPI, NET |
| Offensive Metrics | 14 | Four factors, efficiency |
| Defensive Metrics | 12 | Defensive analytics |
| Tempo & Style | 8 | Pace, style metrics |
| Recent Form | 10 | Momentum |
| Rest & Travel | 8 | Fatigue factors |
| Head-to-Head | 6 | Historical |
| Line Movement | 10 | Odds/sharp action |
| Tournament | 6 | March Madness |
| Injuries | 4 | Availability |
| Predictions | 2 | Model outputs |
| Outcomes | 2 | Results/CLV |

**TOTAL: 100 FEATURES**

---

## COMPLETE FEATURE SPECIFICATION

### 1. GAME INFO (8)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 1 | `game_id` | STRING | Unique identifier |
| 2 | `game_date` | DATE | Game date |
| 3 | `game_time` | TIME | Tip-off (ET) |
| 4 | `home_team` | STRING | Home team |
| 5 | `away_team` | STRING | Away team |
| 6 | `venue` | STRING | Arena |
| 7 | `neutral_site` | INT | Neutral (1/0) |
| 8 | `conference_game` | INT | Conference (1/0) |

### 2. ELO/RATINGS (10)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 9 | `home_elo` | FLOAT | Home ELO |
| 10 | `away_elo` | FLOAT | Away ELO |
| 11 | `elo_diff` | FLOAT | ELO difference |
| 12 | `home_kenpom` | FLOAT | Home KenPom |
| 13 | `away_kenpom` | FLOAT | Away KenPom |
| 14 | `home_bpi` | FLOAT | Home BPI |
| 15 | `away_bpi` | FLOAT | Away BPI |
| 16 | `home_net_ranking` | INT | Home NET rank |
| 17 | `away_net_ranking` | INT | Away NET rank |
| 18 | `elo_win_prob` | FLOAT | Win probability |

### 3. OFFENSIVE METRICS (14)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 19 | `home_adj_off_eff` | FLOAT | Home adj O eff |
| 20 | `away_adj_off_eff` | FLOAT | Away adj O eff |
| 21 | `home_efg_pct` | FLOAT | Home eFG% |
| 22 | `away_efg_pct` | FLOAT | Away eFG% |
| 23 | `home_to_rate` | FLOAT | Home TO rate |
| 24 | `away_to_rate` | FLOAT | Away TO rate |
| 25 | `home_oreb_pct` | FLOAT | Home OREB% |
| 26 | `away_oreb_pct` | FLOAT | Away OREB% |
| 27 | `home_ft_rate` | FLOAT | Home FT rate |
| 28 | `away_ft_rate` | FLOAT | Away FT rate |
| 29 | `home_three_rate` | FLOAT | Home 3P rate |
| 30 | `away_three_rate` | FLOAT | Away 3P rate |
| 31 | `home_ppg` | FLOAT | Home PPG |
| 32 | `away_ppg` | FLOAT | Away PPG |

### 4. DEFENSIVE METRICS (12)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 33 | `home_adj_def_eff` | FLOAT | Home adj D eff |
| 34 | `away_adj_def_eff` | FLOAT | Away adj D eff |
| 35 | `home_opp_efg_pct` | FLOAT | Home opp eFG% |
| 36 | `away_opp_efg_pct` | FLOAT | Away opp eFG% |
| 37 | `home_opp_to_rate` | FLOAT | Home forced TO |
| 38 | `away_opp_to_rate` | FLOAT | Away forced TO |
| 39 | `home_dreb_pct` | FLOAT | Home DREB% |
| 40 | `away_dreb_pct` | FLOAT | Away DREB% |
| 41 | `home_block_pct` | FLOAT | Home BLK% |
| 42 | `away_block_pct` | FLOAT | Away BLK% |
| 43 | `home_ppg_allowed` | FLOAT | Home PPG allowed |
| 44 | `away_ppg_allowed` | FLOAT | Away PPG allowed |

### 5. TEMPO & STYLE (8)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 45 | `home_adj_tempo` | FLOAT | Home adj tempo |
| 46 | `away_adj_tempo` | FLOAT | Away adj tempo |
| 47 | `tempo_diff` | FLOAT | Tempo difference |
| 48 | `home_avg_poss_length` | FLOAT | Home poss length |
| 49 | `away_avg_poss_length` | FLOAT | Away poss length |
| 50 | `home_two_pt_pct` | FLOAT | Home 2P% |
| 51 | `away_two_pt_pct` | FLOAT | Away 2P% |
| 52 | `style_clash_score` | FLOAT | Style mismatch |

### 6. RECENT FORM (10)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 53 | `home_wins_last_10` | INT | Home W last 10 |
| 54 | `away_wins_last_10` | INT | Away W last 10 |
| 55 | `home_ats_last_10` | INT | Home ATS last 10 |
| 56 | `away_ats_last_10` | INT | Away ATS last 10 |
| 57 | `home_streak` | INT | Home streak |
| 58 | `away_streak` | INT | Away streak |
| 59 | `home_margin_avg_10` | FLOAT | Home margin/10 |
| 60 | `away_margin_avg_10` | FLOAT | Away margin/10 |
| 61 | `home_momentum` | FLOAT | Home momentum |
| 62 | `away_momentum` | FLOAT | Away momentum |

### 7. REST & TRAVEL (8)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 63 | `home_rest_days` | INT | Home rest |
| 64 | `away_rest_days` | INT | Away rest |
| 65 | `rest_advantage` | INT | Rest diff |
| 66 | `home_games_7d` | INT | Home games/7d |
| 67 | `away_games_7d` | INT | Away games/7d |
| 68 | `away_travel_miles` | INT | Away travel |
| 69 | `home_b2b` | INT | Home B2B |
| 70 | `away_b2b` | INT | Away B2B |

### 8. HEAD-TO-HEAD (6)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 71 | `h2h_home_wins` | INT | H2H home wins |
| 72 | `h2h_away_wins` | INT | H2H away wins |
| 73 | `h2h_home_ats` | INT | H2H home ATS |
| 74 | `h2h_avg_margin` | FLOAT | H2H margin |
| 75 | `h2h_avg_total` | FLOAT | H2H total |
| 76 | `h2h_last_winner` | INT | Last winner |

### 9. LINE MOVEMENT (10)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 77 | `open_spread` | FLOAT | Open spread |
| 78 | `current_spread` | FLOAT | Current spread |
| 79 | `spread_movement` | FLOAT | Spread move |
| 80 | `open_total` | FLOAT | Open total |
| 81 | `current_total` | FLOAT | Current total |
| 82 | `public_home_pct` | FLOAT | Public home |
| 83 | `sharp_money_pct` | FLOAT | Sharp money |
| 84 | `steam_move` | INT | Steam (1/0) |
| 85 | `reverse_line_move` | INT | RLM (1/0) |
| 86 | `pinnacle_spread` | FLOAT | Pinnacle |

### 10. TOURNAMENT (6)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 87 | `tournament_game` | INT | Tourney (1/0) |
| 88 | `home_seed` | INT | Home seed |
| 89 | `away_seed` | INT | Away seed |
| 90 | `seed_diff` | INT | Seed difference |
| 91 | `home_tourney_exp` | FLOAT | Home experience |
| 92 | `away_tourney_exp` | FLOAT | Away experience |

### 11. INJURIES (4)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 93 | `home_injury_score` | FLOAT | Home injury |
| 94 | `away_injury_score` | FLOAT | Away injury |
| 95 | `home_star_out` | INT | Home star out |
| 96 | `away_star_out` | INT | Away star out |

### 12. PREDICTIONS (2)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 97 | `spread_pred_prob` | FLOAT | Spread prob |
| 98 | `spread_pred_edge` | FLOAT | Spread edge |

### 13. OUTCOMES (2)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 99 | `final_margin` | INT | Final margin |
| 100 | `clv` | FLOAT | CLV |

---

**NCAAB MASTER SHEET - 100 ENTERPRISE FEATURES**
