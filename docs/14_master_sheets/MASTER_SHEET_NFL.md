# NFL MASTER SHEET - ENTERPRISE EDITION
## AI PRO SPORTS | 120 Features | Enterprise-Grade
### Version 3.0 | January 2026

---

## FEATURE CATEGORIES OVERVIEW

| Category | Count | Description |
|----------|-------|-------------|
| Game Info | 8 | Basic game identifiers |
| ELO Ratings | 8 | Power ratings and trends |
| Offensive Efficiency | 15 | EPA, DVOA, advanced offense |
| Defensive Efficiency | 15 | Defensive metrics |
| Quarterback | 12 | QB-specific analytics |
| Recent Form | 10 | Momentum and streaks |
| Rest & Schedule | 10 | Fatigue and situational |
| Head-to-Head | 6 | Historical matchups |
| Line Movement | 12 | Odds and sharp action |
| Weather | 8 | Environmental factors |
| Injuries | 6 | Player availability |
| Predictions | 6 | Model outputs |
| Outcomes | 4 | Results and CLV |

**TOTAL: 120 FEATURES**

---

## COMPLETE FEATURE SPECIFICATION

### 1. GAME INFO (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 1 | `game_id` | STRING | Unique game identifier |
| 2 | `game_date` | DATE | Game date (YYYY-MM-DD) |
| 3 | `game_time` | TIME | Kickoff time (ET) |
| 4 | `week` | INT | NFL week number |
| 5 | `home_team` | STRING | Home team code |
| 6 | `away_team` | STRING | Away team code |
| 7 | `venue` | STRING | Stadium name |
| 8 | `game_type` | STRING | REG/WILD/DIV/CONF/SB |

### 2. ELO RATINGS (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 9 | `home_elo` | FLOAT | Home team ELO rating |
| 10 | `away_elo` | FLOAT | Away team ELO rating |
| 11 | `elo_diff` | FLOAT | ELO difference (home - away) |
| 12 | `home_elo_trend_5` | FLOAT | Home ELO change last 5 games |
| 13 | `away_elo_trend_5` | FLOAT | Away ELO change last 5 games |
| 14 | `elo_home_advantage` | FLOAT | ELO home field value |
| 15 | `elo_win_prob` | FLOAT | ELO-based win probability |
| 16 | `elo_spread_equiv` | FLOAT | ELO converted to spread |

### 3. OFFENSIVE EFFICIENCY (15 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 17 | `home_epa_play` | FLOAT | Home EPA per play |
| 18 | `away_epa_play` | FLOAT | Away EPA per play |
| 19 | `home_epa_pass` | FLOAT | Home EPA on pass plays |
| 20 | `away_epa_pass` | FLOAT | Away EPA on pass plays |
| 21 | `home_epa_rush` | FLOAT | Home EPA on rush plays |
| 22 | `away_epa_rush` | FLOAT | Away EPA on rush plays |
| 23 | `home_success_rate` | FLOAT | Home % positive EPA plays |
| 24 | `away_success_rate` | FLOAT | Away % positive EPA plays |
| 25 | `home_dvoa_off` | FLOAT | Home offensive DVOA |
| 26 | `away_dvoa_off` | FLOAT | Away offensive DVOA |
| 27 | `home_red_zone_td_pct` | FLOAT | Home RZ TD rate |
| 28 | `away_red_zone_td_pct` | FLOAT | Away RZ TD rate |
| 29 | `home_third_down_pct` | FLOAT | Home 3rd down conv % |
| 30 | `away_third_down_pct` | FLOAT | Away 3rd down conv % |
| 31 | `home_explosive_play_rate` | FLOAT | Home 20+ yard plays % |

### 4. DEFENSIVE EFFICIENCY (15 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 32 | `home_def_epa_play` | FLOAT | Home defensive EPA/play |
| 33 | `away_def_epa_play` | FLOAT | Away defensive EPA/play |
| 34 | `home_dvoa_def` | FLOAT | Home defensive DVOA |
| 35 | `away_dvoa_def` | FLOAT | Away defensive DVOA |
| 36 | `home_pressure_rate` | FLOAT | Home QB pressure rate |
| 37 | `away_pressure_rate` | FLOAT | Away QB pressure rate |
| 38 | `home_blitz_rate` | FLOAT | Home blitz frequency |
| 39 | `away_blitz_rate` | FLOAT | Away blitz frequency |
| 40 | `home_sack_rate` | FLOAT | Home sack rate |
| 41 | `away_sack_rate` | FLOAT | Away sack rate |
| 42 | `home_turnover_rate` | FLOAT | Home forced TO rate |
| 43 | `away_turnover_rate` | FLOAT | Away forced TO rate |
| 44 | `home_yards_allowed_play` | FLOAT | Home yards/play allowed |
| 45 | `away_yards_allowed_play` | FLOAT | Away yards/play allowed |
| 46 | `home_opp_red_zone_td_pct` | FLOAT | Home RZ defense |

### 5. QUARTERBACK (12 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 47 | `home_qb_epa` | FLOAT | Home QB EPA |
| 48 | `away_qb_epa` | FLOAT | Away QB EPA |
| 49 | `home_qb_cpoe` | FLOAT | Home completion % over expected |
| 50 | `away_qb_cpoe` | FLOAT | Away completion % over expected |
| 51 | `home_qb_time_to_throw` | FLOAT | Home QB avg time to throw |
| 52 | `away_qb_time_to_throw` | FLOAT | Away QB avg time to throw |
| 53 | `home_qb_air_yards` | FLOAT | Home air yards per attempt |
| 54 | `away_qb_air_yards` | FLOAT | Away air yards per attempt |
| 55 | `home_qb_rating` | FLOAT | Home passer rating |
| 56 | `away_qb_rating` | FLOAT | Away passer rating |
| 57 | `home_qb_status` | INT | Home QB starter (1) or backup (0) |
| 58 | `away_qb_status` | INT | Away QB starter (1) or backup (0) |

### 6. RECENT FORM (10 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 59 | `home_wins_last_5` | INT | Home wins in last 5 |
| 60 | `away_wins_last_5` | INT | Away wins in last 5 |
| 61 | `home_ats_last_5` | INT | Home ATS record last 5 |
| 62 | `away_ats_last_5` | INT | Away ATS record last 5 |
| 63 | `home_streak` | INT | Home win/loss streak |
| 64 | `away_streak` | INT | Away win/loss streak |
| 65 | `home_margin_avg_5` | FLOAT | Home avg margin last 5 |
| 66 | `away_margin_avg_5` | FLOAT | Away avg margin last 5 |
| 67 | `home_momentum_score` | FLOAT | Home weighted momentum |
| 68 | `away_momentum_score` | FLOAT | Away weighted momentum |

### 7. REST & SCHEDULE (10 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 69 | `home_rest_days` | INT | Home days since last game |
| 70 | `away_rest_days` | INT | Away days since last game |
| 71 | `rest_advantage` | INT | Rest difference |
| 72 | `home_bye_week` | INT | Home coming off bye (1/0) |
| 73 | `away_bye_week` | INT | Away coming off bye (1/0) |
| 74 | `home_travel_miles` | INT | Home travel distance |
| 75 | `away_travel_miles` | INT | Away travel distance |
| 76 | `timezone_change` | INT | Time zones crossed |
| 77 | `primetime_game` | INT | SNF/MNF/TNF (1/0) |
| 78 | `divisional_game` | INT | Division matchup (1/0) |

### 8. HEAD-TO-HEAD (6 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 79 | `h2h_home_wins` | INT | H2H home team wins |
| 80 | `h2h_away_wins` | INT | H2H away team wins |
| 81 | `h2h_home_ats` | INT | H2H home ATS record |
| 82 | `h2h_avg_margin` | FLOAT | H2H average margin |
| 83 | `h2h_avg_total` | FLOAT | H2H average total points |
| 84 | `h2h_last_winner` | INT | Last meeting winner (1=home) |

### 9. LINE MOVEMENT (12 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 85 | `open_spread` | FLOAT | Opening spread |
| 86 | `current_spread` | FLOAT | Current spread |
| 87 | `spread_movement` | FLOAT | Spread change |
| 88 | `open_total` | FLOAT | Opening total |
| 89 | `current_total` | FLOAT | Current total |
| 90 | `total_movement` | FLOAT | Total change |
| 91 | `public_home_pct` | FLOAT | Public % on home |
| 92 | `sharp_money_pct` | FLOAT | Sharp money indicator |
| 93 | `steam_move` | INT | Steam move detected (1/0) |
| 94 | `reverse_line_move` | INT | RLM detected (1/0) |
| 95 | `tickets_vs_money` | FLOAT | Ticket/money discrepancy |
| 96 | `pinnacle_spread` | FLOAT | Pinnacle closing line |

### 10. WEATHER (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 97 | `temperature` | INT | Game time temperature (F) |
| 98 | `wind_speed` | INT | Wind speed (mph) |
| 99 | `wind_direction` | STRING | Wind direction |
| 100 | `precipitation_pct` | FLOAT | Precipitation probability |
| 101 | `humidity` | INT | Humidity percentage |
| 102 | `dome` | INT | Indoor game (1/0) |
| 103 | `surface_type` | STRING | Grass/Turf |
| 104 | `weather_impact_score` | FLOAT | Weather effect on totals |

### 11. INJURIES (6 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 105 | `home_injury_score` | FLOAT | Home injury impact (0-10) |
| 106 | `away_injury_score` | FLOAT | Away injury impact (0-10) |
| 107 | `home_players_out` | INT | Home players ruled out |
| 108 | `away_players_out` | INT | Away players ruled out |
| 109 | `home_star_out` | INT | Home star player out (1/0) |
| 110 | `away_star_out` | INT | Away star player out (1/0) |

### 12. PREDICTIONS (6 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 111 | `spread_pred_prob` | FLOAT | Spread prediction probability |
| 112 | `spread_pred_edge` | FLOAT | Spread edge vs market |
| 113 | `ml_pred_prob` | FLOAT | Moneyline probability |
| 114 | `ml_pred_edge` | FLOAT | Moneyline edge vs market |
| 115 | `total_pred_prob` | FLOAT | Total prediction probability |
| 116 | `total_pred_edge` | FLOAT | Total edge vs market |

### 13. OUTCOMES (4 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 117 | `home_score` | INT | Final home score |
| 118 | `away_score` | INT | Final away score |
| 119 | `result_ats` | STRING | W/L/P against spread |
| 120 | `clv` | FLOAT | Closing line value |

---

## DATA SOURCES

| Source | Features | Update Frequency |
|--------|----------|------------------|
| nflfastR | EPA, CPOE, success rate | Weekly |
| Football Outsiders | DVOA | Weekly |
| TheOddsAPI | Lines, odds | Real-time |
| ESPN | Scores, schedules | Real-time |
| Weather API | Weather data | Game day |

---

**NFL MASTER SHEET - 120 ENTERPRISE FEATURES**
**AI PRO SPORTS | Version 3.0**
