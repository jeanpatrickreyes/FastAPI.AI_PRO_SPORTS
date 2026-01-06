# NBA MASTER SHEET - ENTERPRISE EDITION
## AI PRO SPORTS | 130 Features | Enterprise-Grade
### Version 3.0 | January 2026

---

## FEATURE CATEGORIES OVERVIEW

| Category | Count | Description |
|----------|-------|-------------|
| Game Info | 8 | Basic game identifiers |
| ELO Ratings | 8 | Power ratings and trends |
| Offensive Metrics | 16 | Advanced offense |
| Defensive Metrics | 14 | Advanced defense |
| Four Factors | 8 | Dean Oliver's factors |
| Player Tracking | 14 | SportVU/tracking data |
| Recent Form | 10 | Momentum and streaks |
| Rest & Fatigue | 12 | Load management |
| Head-to-Head | 6 | Historical matchups |
| Line Movement | 12 | Odds and sharp action |
| Injuries | 8 | Player availability |
| Play Types | 8 | Offensive play style |
| Predictions | 4 | Model outputs |
| Outcomes | 2 | Results and CLV |

**TOTAL: 130 FEATURES**

---

## COMPLETE FEATURE SPECIFICATION

### 1. GAME INFO (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 1 | `game_id` | STRING | Unique game identifier |
| 2 | `game_date` | DATE | Game date (YYYY-MM-DD) |
| 3 | `game_time` | TIME | Tip-off time (ET) |
| 4 | `home_team` | STRING | Home team code |
| 5 | `away_team` | STRING | Away team code |
| 6 | `venue` | STRING | Arena name |
| 7 | `season_type` | STRING | REG/PLAY/PLAYIN |
| 8 | `national_tv` | INT | National TV game (1/0) |

### 2. ELO RATINGS (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 9 | `home_elo` | FLOAT | Home team ELO rating |
| 10 | `away_elo` | FLOAT | Away team ELO rating |
| 11 | `elo_diff` | FLOAT | ELO difference |
| 12 | `home_elo_trend_10` | FLOAT | Home ELO trend (10 games) |
| 13 | `away_elo_trend_10` | FLOAT | Away ELO trend (10 games) |
| 14 | `elo_home_advantage` | FLOAT | ELO home court value |
| 15 | `elo_win_prob` | FLOAT | ELO win probability |
| 16 | `elo_spread_equiv` | FLOAT | ELO converted to spread |

### 3. OFFENSIVE METRICS (16 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 17 | `home_off_rating` | FLOAT | Home offensive rating |
| 18 | `away_off_rating` | FLOAT | Away offensive rating |
| 19 | `home_pace` | FLOAT | Home possessions/48 |
| 20 | `away_pace` | FLOAT | Away possessions/48 |
| 21 | `home_ts_pct` | FLOAT | Home true shooting % |
| 22 | `away_ts_pct` | FLOAT | Away true shooting % |
| 23 | `home_efg_pct` | FLOAT | Home effective FG % |
| 24 | `away_efg_pct` | FLOAT | Away effective FG % |
| 25 | `home_three_rate` | FLOAT | Home 3PA/FGA |
| 26 | `away_three_rate` | FLOAT | Away 3PA/FGA |
| 27 | `home_ft_rate` | FLOAT | Home FTA/FGA |
| 28 | `away_ft_rate` | FLOAT | Away FTA/FGA |
| 29 | `home_assist_ratio` | FLOAT | Home assists per 100 |
| 30 | `away_assist_ratio` | FLOAT | Away assists per 100 |
| 31 | `home_paint_pts` | FLOAT | Home points in paint |
| 32 | `away_paint_pts` | FLOAT | Away points in paint |

### 4. DEFENSIVE METRICS (14 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 33 | `home_def_rating` | FLOAT | Home defensive rating |
| 34 | `away_def_rating` | FLOAT | Away defensive rating |
| 35 | `home_net_rating` | FLOAT | Home net rating |
| 36 | `away_net_rating` | FLOAT | Away net rating |
| 37 | `home_opp_ts_pct` | FLOAT | Home opp TS% allowed |
| 38 | `away_opp_ts_pct` | FLOAT | Away opp TS% allowed |
| 39 | `home_stl_pct` | FLOAT | Home steal % |
| 40 | `away_stl_pct` | FLOAT | Away steal % |
| 41 | `home_blk_pct` | FLOAT | Home block % |
| 42 | `away_blk_pct` | FLOAT | Away block % |
| 43 | `home_dreb_pct` | FLOAT | Home defensive reb % |
| 44 | `away_dreb_pct` | FLOAT | Away defensive reb % |
| 45 | `home_tov_forced_pct` | FLOAT | Home forced TO % |
| 46 | `away_tov_forced_pct` | FLOAT | Away forced TO % |

### 5. FOUR FACTORS (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 47 | `home_efg_factor` | FLOAT | Home eFG% factor |
| 48 | `away_efg_factor` | FLOAT | Away eFG% factor |
| 49 | `home_tov_factor` | FLOAT | Home TO% factor |
| 50 | `away_tov_factor` | FLOAT | Away TO% factor |
| 51 | `home_oreb_factor` | FLOAT | Home OREB% factor |
| 52 | `away_oreb_factor` | FLOAT | Away OREB% factor |
| 53 | `home_ft_factor` | FLOAT | Home FT rate factor |
| 54 | `away_ft_factor` | FLOAT | Away FT rate factor |

### 6. PLAYER TRACKING (14 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 55 | `home_avg_speed` | FLOAT | Home team avg speed |
| 56 | `away_avg_speed` | FLOAT | Away team avg speed |
| 57 | `home_distance_miles` | FLOAT | Home distance/game |
| 58 | `away_distance_miles` | FLOAT | Away distance/game |
| 59 | `home_touches` | FLOAT | Home touches/game |
| 60 | `away_touches` | FLOAT | Away touches/game |
| 61 | `home_contested_shots_pct` | FLOAT | Home contested shot % |
| 62 | `away_contested_shots_pct` | FLOAT | Away contested shot % |
| 63 | `home_open_3_pct` | FLOAT | Home wide open 3s % |
| 64 | `away_open_3_pct` | FLOAT | Away wide open 3s % |
| 65 | `home_transition_freq` | FLOAT | Home fast break freq |
| 66 | `away_transition_freq` | FLOAT | Away fast break freq |
| 67 | `home_clutch_net_rating` | FLOAT | Home clutch net rating |
| 68 | `away_clutch_net_rating` | FLOAT | Away clutch net rating |

### 7. RECENT FORM (10 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 69 | `home_wins_last_5` | INT | Home wins last 5 |
| 70 | `away_wins_last_5` | INT | Away wins last 5 |
| 71 | `home_wins_last_10` | INT | Home wins last 10 |
| 72 | `away_wins_last_10` | INT | Away wins last 10 |
| 73 | `home_ats_last_10` | INT | Home ATS last 10 |
| 74 | `away_ats_last_10` | INT | Away ATS last 10 |
| 75 | `home_streak` | INT | Home streak |
| 76 | `away_streak` | INT | Away streak |
| 77 | `home_margin_avg_10` | FLOAT | Home margin last 10 |
| 78 | `away_margin_avg_10` | FLOAT | Away margin last 10 |

### 8. REST & FATIGUE (12 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 79 | `home_rest_days` | INT | Home days rest |
| 80 | `away_rest_days` | INT | Away days rest |
| 81 | `rest_advantage` | INT | Rest difference |
| 82 | `home_b2b` | INT | Home back-to-back (1/0) |
| 83 | `away_b2b` | INT | Away back-to-back (1/0) |
| 84 | `home_games_7d` | INT | Home games in 7 days |
| 85 | `away_games_7d` | INT | Away games in 7 days |
| 86 | `home_travel_miles` | INT | Home travel distance |
| 87 | `away_travel_miles` | INT | Away travel distance |
| 88 | `home_starter_minutes_avg` | FLOAT | Home starter minutes |
| 89 | `away_starter_minutes_avg` | FLOAT | Away starter minutes |
| 90 | `altitude_change` | INT | Altitude difference |

### 9. HEAD-TO-HEAD (6 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 91 | `h2h_home_wins` | INT | H2H home wins |
| 92 | `h2h_away_wins` | INT | H2H away wins |
| 93 | `h2h_home_ats` | INT | H2H home ATS |
| 94 | `h2h_avg_margin` | FLOAT | H2H avg margin |
| 95 | `h2h_avg_total` | FLOAT | H2H avg total |
| 96 | `h2h_last_winner` | INT | Last meeting winner |

### 10. LINE MOVEMENT (12 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 97 | `open_spread` | FLOAT | Opening spread |
| 98 | `current_spread` | FLOAT | Current spread |
| 99 | `spread_movement` | FLOAT | Spread change |
| 100 | `open_total` | FLOAT | Opening total |
| 101 | `current_total` | FLOAT | Current total |
| 102 | `total_movement` | FLOAT | Total change |
| 103 | `public_home_pct` | FLOAT | Public % on home |
| 104 | `sharp_money_pct` | FLOAT | Sharp money % |
| 105 | `steam_move` | INT | Steam move (1/0) |
| 106 | `reverse_line_move` | INT | RLM (1/0) |
| 107 | `tickets_vs_money` | FLOAT | Ticket/money gap |
| 108 | `pinnacle_spread` | FLOAT | Pinnacle line |

### 11. INJURIES (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 109 | `home_injury_score` | FLOAT | Home injury impact |
| 110 | `away_injury_score` | FLOAT | Away injury impact |
| 111 | `home_minutes_lost` | FLOAT | Home minutes unavailable |
| 112 | `away_minutes_lost` | FLOAT | Away minutes unavailable |
| 113 | `home_star_out` | INT | Home star out (1/0) |
| 114 | `away_star_out` | INT | Away star out (1/0) |
| 115 | `home_load_management` | INT | Home resting players |
| 116 | `away_load_management` | INT | Away resting players |

### 12. PLAY TYPES (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 117 | `home_isolation_freq` | FLOAT | Home ISO frequency |
| 118 | `away_isolation_freq` | FLOAT | Away ISO frequency |
| 119 | `home_pnr_freq` | FLOAT | Home PnR frequency |
| 120 | `away_pnr_freq` | FLOAT | Away PnR frequency |
| 121 | `home_spot_up_freq` | FLOAT | Home spot up freq |
| 122 | `away_spot_up_freq` | FLOAT | Away spot up freq |
| 123 | `home_post_up_freq` | FLOAT | Home post up freq |
| 124 | `away_post_up_freq` | FLOAT | Away post up freq |

### 13. PREDICTIONS (4 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 125 | `spread_pred_prob` | FLOAT | Spread probability |
| 126 | `spread_pred_edge` | FLOAT | Spread edge |
| 127 | `total_pred_prob` | FLOAT | Total probability |
| 128 | `total_pred_edge` | FLOAT | Total edge |

### 14. OUTCOMES (2 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 129 | `final_margin` | INT | Final point margin |
| 130 | `clv` | FLOAT | Closing line value |

---

## DATA SOURCES

| Source | Features | Update Frequency |
|--------|----------|------------------|
| NBA Stats API | All metrics | Real-time |
| Basketball Reference | Advanced stats | Daily |
| TheOddsAPI | Lines, odds | Real-time |
| ESPN | Scores, injuries | Real-time |

---

**NBA MASTER SHEET - 130 ENTERPRISE FEATURES**
**AI PRO SPORTS | Version 3.0**
