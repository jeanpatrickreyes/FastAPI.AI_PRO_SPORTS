# MLB MASTER SHEET - ENTERPRISE EDITION
## AI PRO SPORTS | 150 Features | Enterprise-Grade
### Version 3.0 | January 2026

---

## FEATURE CATEGORIES OVERVIEW

| Category | Count | Description |
|----------|-------|-------------|
| Game Info | 10 | Basic game identifiers |
| ELO Ratings | 8 | Power ratings |
| Starting Pitcher | 20 | SP sabermetrics |
| Bullpen | 12 | Relief pitching |
| Team Batting | 20 | Offensive sabermetrics |
| Statcast Batting | 14 | Exit velo, launch angle |
| Statcast Pitching | 12 | Pitch quality metrics |
| Matchup Analysis | 10 | Platoon, pitcher vs lineup |
| Ballpark & Weather | 10 | Environmental factors |
| Recent Form | 10 | Momentum |
| Line Movement | 12 | Odds and sharp action |
| Injuries | 6 | Player availability |
| Predictions | 4 | Model outputs |
| Outcomes | 2 | Results and CLV |

**TOTAL: 150 FEATURES**

---

## COMPLETE FEATURE SPECIFICATION

### 1. GAME INFO (10 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 1 | `game_id` | STRING | Unique game identifier |
| 2 | `game_date` | DATE | Game date (YYYY-MM-DD) |
| 3 | `game_time` | TIME | First pitch time (ET) |
| 4 | `home_team` | STRING | Home team code |
| 5 | `away_team` | STRING | Away team code |
| 6 | `venue` | STRING | Ballpark name |
| 7 | `day_night` | STRING | Day/Night game |
| 8 | `series_game` | INT | Game # in series |
| 9 | `doubleheader` | INT | DH game (1/0) |
| 10 | `umpire_hp` | STRING | Home plate umpire |

### 2. ELO RATINGS (8 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 11 | `home_elo` | FLOAT | Home team ELO |
| 12 | `away_elo` | FLOAT | Away team ELO |
| 13 | `elo_diff` | FLOAT | ELO difference |
| 14 | `home_elo_trend` | FLOAT | Home ELO trend |
| 15 | `away_elo_trend` | FLOAT | Away ELO trend |
| 16 | `elo_home_advantage` | FLOAT | ELO home value |
| 17 | `elo_win_prob` | FLOAT | ELO win probability |
| 18 | `elo_run_line_equiv` | FLOAT | ELO to run line |

### 3. STARTING PITCHER (20 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 19 | `home_sp_era` | FLOAT | Home SP ERA |
| 20 | `away_sp_era` | FLOAT | Away SP ERA |
| 21 | `home_sp_fip` | FLOAT | Home SP FIP |
| 22 | `away_sp_fip` | FLOAT | Away SP FIP |
| 23 | `home_sp_xfip` | FLOAT | Home SP xFIP |
| 24 | `away_sp_xfip` | FLOAT | Away SP xFIP |
| 25 | `home_sp_siera` | FLOAT | Home SP SIERA |
| 26 | `away_sp_siera` | FLOAT | Away SP SIERA |
| 27 | `home_sp_whip` | FLOAT | Home SP WHIP |
| 28 | `away_sp_whip` | FLOAT | Away SP WHIP |
| 29 | `home_sp_k_rate` | FLOAT | Home SP K/9 |
| 30 | `away_sp_k_rate` | FLOAT | Away SP K/9 |
| 31 | `home_sp_bb_rate` | FLOAT | Home SP BB/9 |
| 32 | `away_sp_bb_rate` | FLOAT | Away SP BB/9 |
| 33 | `home_sp_hr_rate` | FLOAT | Home SP HR/9 |
| 34 | `away_sp_hr_rate` | FLOAT | Away SP HR/9 |
| 35 | `home_sp_gb_rate` | FLOAT | Home SP GB% |
| 36 | `away_sp_gb_rate` | FLOAT | Away SP GB% |
| 37 | `home_sp_rest_days` | INT | Home SP days rest |
| 38 | `away_sp_rest_days` | INT | Away SP days rest |

### 4. BULLPEN (12 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 39 | `home_bullpen_era` | FLOAT | Home BP ERA |
| 40 | `away_bullpen_era` | FLOAT | Away BP ERA |
| 41 | `home_bullpen_fip` | FLOAT | Home BP FIP |
| 42 | `away_bullpen_fip` | FLOAT | Away BP FIP |
| 43 | `home_bullpen_innings_7d` | FLOAT | Home BP IP last 7d |
| 44 | `away_bullpen_innings_7d` | FLOAT | Away BP IP last 7d |
| 45 | `home_closer_available` | INT | Home closer rested (1/0) |
| 46 | `away_closer_available` | INT | Away closer rested (1/0) |
| 47 | `home_high_lev_available` | INT | Home setup rested |
| 48 | `away_high_lev_available` | INT | Away setup rested |
| 49 | `home_bullpen_usage_score` | FLOAT | Home BP fatigue |
| 50 | `away_bullpen_usage_score` | FLOAT | Away BP fatigue |

### 5. TEAM BATTING (20 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 51 | `home_woba` | FLOAT | Home team wOBA |
| 52 | `away_woba` | FLOAT | Away team wOBA |
| 53 | `home_xwoba` | FLOAT | Home team xwOBA |
| 54 | `away_xwoba` | FLOAT | Away team xwOBA |
| 55 | `home_wrc_plus` | FLOAT | Home wRC+ |
| 56 | `away_wrc_plus` | FLOAT | Away wRC+ |
| 57 | `home_ops` | FLOAT | Home OPS |
| 58 | `away_ops` | FLOAT | Away OPS |
| 59 | `home_iso` | FLOAT | Home ISO (power) |
| 60 | `away_iso` | FLOAT | Away ISO |
| 61 | `home_babip` | FLOAT | Home BABIP |
| 62 | `away_babip` | FLOAT | Away BABIP |
| 63 | `home_k_rate` | FLOAT | Home K% |
| 64 | `away_k_rate` | FLOAT | Away K% |
| 65 | `home_bb_rate` | FLOAT | Home BB% |
| 66 | `away_bb_rate` | FLOAT | Away BB% |
| 67 | `home_runs_per_game` | FLOAT | Home R/G |
| 68 | `away_runs_per_game` | FLOAT | Away R/G |
| 69 | `home_war_batting` | FLOAT | Home batting WAR |
| 70 | `away_war_batting` | FLOAT | Away batting WAR |

### 6. STATCAST BATTING (14 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 71 | `home_exit_velo` | FLOAT | Home avg exit velo |
| 72 | `away_exit_velo` | FLOAT | Away avg exit velo |
| 73 | `home_launch_angle` | FLOAT | Home avg launch angle |
| 74 | `away_launch_angle` | FLOAT | Away avg launch angle |
| 75 | `home_barrel_rate` | FLOAT | Home barrel % |
| 76 | `away_barrel_rate` | FLOAT | Away barrel % |
| 77 | `home_hard_hit_rate` | FLOAT | Home hard hit % |
| 78 | `away_hard_hit_rate` | FLOAT | Away hard hit % |
| 79 | `home_sweet_spot_pct` | FLOAT | Home sweet spot % |
| 80 | `away_sweet_spot_pct` | FLOAT | Away sweet spot % |
| 81 | `home_sprint_speed` | FLOAT | Home team speed |
| 82 | `away_sprint_speed` | FLOAT | Away team speed |
| 83 | `home_xba` | FLOAT | Home expected BA |
| 84 | `away_xba` | FLOAT | Away expected BA |

### 7. STATCAST PITCHING (12 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 85 | `home_sp_stuff_plus` | FLOAT | Home SP Stuff+ |
| 86 | `away_sp_stuff_plus` | FLOAT | Away SP Stuff+ |
| 87 | `home_sp_location_plus` | FLOAT | Home SP Location+ |
| 88 | `away_sp_location_plus` | FLOAT | Away SP Location+ |
| 89 | `home_sp_whiff_rate` | FLOAT | Home SP whiff % |
| 90 | `away_sp_whiff_rate` | FLOAT | Away SP whiff % |
| 91 | `home_sp_chase_rate` | FLOAT | Home SP chase % |
| 92 | `away_sp_chase_rate` | FLOAT | Away SP chase % |
| 93 | `home_sp_spin_rate` | FLOAT | Home SP avg spin |
| 94 | `away_sp_spin_rate` | FLOAT | Away SP avg spin |
| 95 | `home_sp_extension` | FLOAT | Home SP extension |
| 96 | `away_sp_extension` | FLOAT | Away SP extension |

### 8. MATCHUP ANALYSIS (10 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 97 | `platoon_advantage_home` | FLOAT | Home platoon edge |
| 98 | `platoon_advantage_away` | FLOAT | Away platoon edge |
| 99 | `home_vs_rhp` | FLOAT | Home team vs RHP |
| 100 | `home_vs_lhp` | FLOAT | Home team vs LHP |
| 101 | `away_vs_rhp` | FLOAT | Away team vs RHP |
| 102 | `away_vs_lhp` | FLOAT | Away team vs LHP |
| 103 | `home_sp_vs_opp_woba` | FLOAT | Home SP vs opp lineup |
| 104 | `away_sp_vs_opp_woba` | FLOAT | Away SP vs opp lineup |
| 105 | `home_lineup_score` | FLOAT | Home lineup strength |
| 106 | `away_lineup_score` | FLOAT | Away lineup strength |

### 9. BALLPARK & WEATHER (10 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 107 | `park_factor_runs` | FLOAT | Park runs factor |
| 108 | `park_factor_hr` | FLOAT | Park HR factor |
| 109 | `temperature` | INT | Game temperature |
| 110 | `wind_speed` | INT | Wind speed |
| 111 | `wind_direction` | STRING | Wind direction |
| 112 | `humidity` | INT | Humidity % |
| 113 | `precipitation_pct` | FLOAT | Rain probability |
| 114 | `roof_status` | STRING | Open/Closed/None |
| 115 | `weather_total_impact` | FLOAT | Weather on total |
| 116 | `umpire_k_rate` | FLOAT | Ump K rate tendency |

### 10. RECENT FORM (10 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 117 | `home_wins_last_10` | INT | Home W last 10 |
| 118 | `away_wins_last_10` | INT | Away W last 10 |
| 119 | `home_runs_last_10` | FLOAT | Home R/G last 10 |
| 120 | `away_runs_last_10` | FLOAT | Away R/G last 10 |
| 121 | `home_era_last_10` | FLOAT | Home ERA last 10 |
| 122 | `away_era_last_10` | FLOAT | Away ERA last 10 |
| 123 | `home_streak` | INT | Home streak |
| 124 | `away_streak` | INT | Away streak |
| 125 | `home_rl_last_10` | INT | Home RL last 10 |
| 126 | `away_rl_last_10` | INT | Away RL last 10 |

### 11. LINE MOVEMENT (12 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 127 | `open_run_line` | FLOAT | Opening run line |
| 128 | `current_run_line` | FLOAT | Current run line |
| 129 | `open_total` | FLOAT | Opening total |
| 130 | `current_total` | FLOAT | Current total |
| 131 | `open_ml_home` | INT | Opening home ML |
| 132 | `current_ml_home` | INT | Current home ML |
| 133 | `public_home_pct` | FLOAT | Public on home |
| 134 | `sharp_money_pct` | FLOAT | Sharp money % |
| 135 | `steam_move` | INT | Steam move (1/0) |
| 136 | `reverse_line_move` | INT | RLM (1/0) |
| 137 | `tickets_vs_money` | FLOAT | Ticket/money gap |
| 138 | `pinnacle_ml` | INT | Pinnacle ML |

### 12. INJURIES (6 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 139 | `home_injury_score` | FLOAT | Home injury impact |
| 140 | `away_injury_score` | FLOAT | Away injury impact |
| 141 | `home_war_on_il` | FLOAT | Home WAR on IL |
| 142 | `away_war_on_il` | FLOAT | Away WAR on IL |
| 143 | `home_lineup_healthy` | INT | Home lineup full |
| 144 | `away_lineup_healthy` | INT | Away lineup full |

### 13. PREDICTIONS (4 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 145 | `ml_pred_prob` | FLOAT | ML probability |
| 146 | `ml_pred_edge` | FLOAT | ML edge |
| 147 | `total_pred_prob` | FLOAT | Total probability |
| 148 | `total_pred_edge` | FLOAT | Total edge |

### 14. OUTCOMES (2 features)
| # | Feature Name | Type | Description |
|---|--------------|------|-------------|
| 149 | `run_differential` | INT | Final run diff |
| 150 | `clv` | FLOAT | Closing line value |

---

## DATA SOURCES

| Source | Features | Update Frequency |
|--------|----------|------------------|
| FanGraphs | Sabermetrics | Daily |
| Baseball Savant | Statcast | Real-time |
| Baseball Reference | Traditional | Daily |
| TheOddsAPI | Lines, odds | Real-time |

---

**MLB MASTER SHEET - 150 ENTERPRISE FEATURES**
**AI PRO SPORTS | Version 3.0**
