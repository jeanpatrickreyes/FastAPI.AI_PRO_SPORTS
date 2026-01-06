# NCAAF MASTER SHEET - ENTERPRISE EDITION
## AI PRO SPORTS | 100 Features | Enterprise-Grade
### Version 3.0 | January 2026

---

## FEATURE CATEGORIES OVERVIEW

| Category | Count | Description |
|----------|-------|-------------|
| Game Info | 8 | Basic identifiers |
| ELO/Ratings | 8 | Power ratings, SP+ |
| Offensive Efficiency | 14 | EPA, success rate |
| Defensive Efficiency | 12 | Defensive metrics |
| Quarterback | 8 | QB analytics |
| Recent Form | 10 | Momentum |
| Rest & Schedule | 8 | Situational |
| Head-to-Head | 6 | Historical |
| Line Movement | 10 | Odds/sharp action |
| Weather | 8 | Environmental |
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
| 3 | `game_time` | TIME | Kickoff time (ET) |
| 4 | `week` | INT | Week number |
| 5 | `home_team` | STRING | Home team |
| 6 | `away_team` | STRING | Away team |
| 7 | `venue` | STRING | Stadium |
| 8 | `conference_game` | INT | Conference (1/0) |

### 2. ELO/RATINGS (8)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 9 | `home_elo` | FLOAT | Home ELO |
| 10 | `away_elo` | FLOAT | Away ELO |
| 11 | `elo_diff` | FLOAT | ELO difference |
| 12 | `home_sp_plus` | FLOAT | Home SP+ rating |
| 13 | `away_sp_plus` | FLOAT | Away SP+ rating |
| 14 | `home_fpi` | FLOAT | Home FPI |
| 15 | `away_fpi` | FLOAT | Away FPI |
| 16 | `elo_win_prob` | FLOAT | Win probability |

### 3. OFFENSIVE EFFICIENCY (14)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 17 | `home_epa_play` | FLOAT | Home EPA/play |
| 18 | `away_epa_play` | FLOAT | Away EPA/play |
| 19 | `home_epa_pass` | FLOAT | Home pass EPA |
| 20 | `away_epa_pass` | FLOAT | Away pass EPA |
| 21 | `home_epa_rush` | FLOAT | Home rush EPA |
| 22 | `away_epa_rush` | FLOAT | Away rush EPA |
| 23 | `home_success_rate` | FLOAT | Home success rate |
| 24 | `away_success_rate` | FLOAT | Away success rate |
| 25 | `home_explosiveness` | FLOAT | Home big play rate |
| 26 | `away_explosiveness` | FLOAT | Away big play rate |
| 27 | `home_ppg` | FLOAT | Home points/game |
| 28 | `away_ppg` | FLOAT | Away points/game |
| 29 | `home_ypg` | FLOAT | Home yards/game |
| 30 | `away_ypg` | FLOAT | Away yards/game |

### 4. DEFENSIVE EFFICIENCY (12)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 31 | `home_def_epa_play` | FLOAT | Home def EPA/play |
| 32 | `away_def_epa_play` | FLOAT | Away def EPA/play |
| 33 | `home_ppg_allowed` | FLOAT | Home PPG allowed |
| 34 | `away_ppg_allowed` | FLOAT | Away PPG allowed |
| 35 | `home_ypg_allowed` | FLOAT | Home YPG allowed |
| 36 | `away_ypg_allowed` | FLOAT | Away YPG allowed |
| 37 | `home_sack_rate` | FLOAT | Home sack rate |
| 38 | `away_sack_rate` | FLOAT | Away sack rate |
| 39 | `home_havoc_rate` | FLOAT | Home havoc rate |
| 40 | `away_havoc_rate` | FLOAT | Away havoc rate |
| 41 | `home_stuff_rate` | FLOAT | Home run stuff rate |
| 42 | `away_stuff_rate` | FLOAT | Away run stuff rate |

### 5. QUARTERBACK (8)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 43 | `home_qb_rating` | FLOAT | Home QB rating |
| 44 | `away_qb_rating` | FLOAT | Away QB rating |
| 45 | `home_qb_epa` | FLOAT | Home QB EPA |
| 46 | `away_qb_epa` | FLOAT | Away QB EPA |
| 47 | `home_qb_experience` | INT | Home QB exp (years) |
| 48 | `away_qb_experience` | INT | Away QB exp (years) |
| 49 | `home_qb_status` | INT | Home QB starter (1/0) |
| 50 | `away_qb_status` | INT | Away QB starter (1/0) |

### 6. RECENT FORM (10)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 51 | `home_wins_last_5` | INT | Home W last 5 |
| 52 | `away_wins_last_5` | INT | Away W last 5 |
| 53 | `home_ats_last_5` | INT | Home ATS last 5 |
| 54 | `away_ats_last_5` | INT | Away ATS last 5 |
| 55 | `home_streak` | INT | Home streak |
| 56 | `away_streak` | INT | Away streak |
| 57 | `home_margin_avg_5` | FLOAT | Home margin/5 |
| 58 | `away_margin_avg_5` | FLOAT | Away margin/5 |
| 59 | `home_momentum` | FLOAT | Home momentum |
| 60 | `away_momentum` | FLOAT | Away momentum |

### 7. REST & SCHEDULE (8)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 61 | `home_rest_days` | INT | Home rest days |
| 62 | `away_rest_days` | INT | Away rest days |
| 63 | `rest_advantage` | INT | Rest diff |
| 64 | `home_bye_week` | INT | Home off bye (1/0) |
| 65 | `away_bye_week` | INT | Away off bye (1/0) |
| 66 | `rivalry_game` | INT | Rivalry (1/0) |
| 67 | `bowl_game` | INT | Bowl game (1/0) |
| 68 | `playoff_game` | INT | CFP game (1/0) |

### 8. HEAD-TO-HEAD (6)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 69 | `h2h_home_wins` | INT | H2H home wins |
| 70 | `h2h_away_wins` | INT | H2H away wins |
| 71 | `h2h_home_ats` | INT | H2H home ATS |
| 72 | `h2h_avg_margin` | FLOAT | H2H avg margin |
| 73 | `h2h_avg_total` | FLOAT | H2H avg total |
| 74 | `h2h_last_winner` | INT | Last winner |

### 9. LINE MOVEMENT (10)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 75 | `open_spread` | FLOAT | Opening spread |
| 76 | `current_spread` | FLOAT | Current spread |
| 77 | `spread_movement` | FLOAT | Spread move |
| 78 | `open_total` | FLOAT | Opening total |
| 79 | `current_total` | FLOAT | Current total |
| 80 | `public_home_pct` | FLOAT | Public on home |
| 81 | `sharp_money_pct` | FLOAT | Sharp money % |
| 82 | `steam_move` | INT | Steam (1/0) |
| 83 | `reverse_line_move` | INT | RLM (1/0) |
| 84 | `pinnacle_spread` | FLOAT | Pinnacle line |

### 10. WEATHER (8)
| # | Feature | Type | Description |
|---|---------|------|-------------|
| 85 | `temperature` | INT | Temperature (F) |
| 86 | `wind_speed` | INT | Wind (mph) |
| 87 | `wind_direction` | STRING | Wind direction |
| 88 | `precipitation_pct` | FLOAT | Rain % |
| 89 | `humidity` | INT | Humidity % |
| 90 | `dome` | INT | Indoor (1/0) |
| 91 | `altitude` | INT | Elevation (ft) |
| 92 | `weather_impact` | FLOAT | Weather effect |

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

**NCAAF MASTER SHEET - 100 ENTERPRISE FEATURES**
