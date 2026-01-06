# WNBA MASTER SHEET - ENTERPRISE EDITION
## AI PRO SPORTS | 95 Features | Enterprise-Grade
### Version 3.0 | January 2026

---

## FEATURE SUMMARY: 95 TOTAL FEATURES

| Category | Count |
|----------|-------|
| Game Info | 7 |
| ELO Ratings | 6 |
| Offensive Metrics | 14 |
| Defensive Metrics | 12 |
| Four Factors | 8 |
| Recent Form | 10 |
| Rest & Travel | 10 |
| Head-to-Head | 6 |
| Line Movement | 10 |
| Injuries | 6 |
| Predictions | 4 |
| Outcomes | 2 |

---

## ALL 95 FEATURES

| # | Feature Name | Category | Type |
|---|--------------|----------|------|
| 1 | `game_id` | Game Info | STRING |
| 2 | `game_date` | Game Info | DATE |
| 3 | `game_time` | Game Info | TIME |
| 4 | `home_team` | Game Info | STRING |
| 5 | `away_team` | Game Info | STRING |
| 6 | `venue` | Game Info | STRING |
| 7 | `national_tv` | Game Info | INT |
| 8 | `home_elo` | ELO | FLOAT |
| 9 | `away_elo` | ELO | FLOAT |
| 10 | `elo_diff` | ELO | FLOAT |
| 11 | `home_elo_trend` | ELO | FLOAT |
| 12 | `away_elo_trend` | ELO | FLOAT |
| 13 | `elo_win_prob` | ELO | FLOAT |
| 14 | `home_off_rating` | Offensive | FLOAT |
| 15 | `away_off_rating` | Offensive | FLOAT |
| 16 | `home_pace` | Offensive | FLOAT |
| 17 | `away_pace` | Offensive | FLOAT |
| 18 | `home_ts_pct` | Offensive | FLOAT |
| 19 | `away_ts_pct` | Offensive | FLOAT |
| 20 | `home_efg_pct` | Offensive | FLOAT |
| 21 | `away_efg_pct` | Offensive | FLOAT |
| 22 | `home_three_rate` | Offensive | FLOAT |
| 23 | `away_three_rate` | Offensive | FLOAT |
| 24 | `home_ft_rate` | Offensive | FLOAT |
| 25 | `away_ft_rate` | Offensive | FLOAT |
| 26 | `home_ppg` | Offensive | FLOAT |
| 27 | `away_ppg` | Offensive | FLOAT |
| 28 | `home_def_rating` | Defensive | FLOAT |
| 29 | `away_def_rating` | Defensive | FLOAT |
| 30 | `home_net_rating` | Defensive | FLOAT |
| 31 | `away_net_rating` | Defensive | FLOAT |
| 32 | `home_opp_ts_pct` | Defensive | FLOAT |
| 33 | `away_opp_ts_pct` | Defensive | FLOAT |
| 34 | `home_stl_pct` | Defensive | FLOAT |
| 35 | `away_stl_pct` | Defensive | FLOAT |
| 36 | `home_blk_pct` | Defensive | FLOAT |
| 37 | `away_blk_pct` | Defensive | FLOAT |
| 38 | `home_dreb_pct` | Defensive | FLOAT |
| 39 | `away_dreb_pct` | Defensive | FLOAT |
| 40 | `home_efg_factor` | Four Factors | FLOAT |
| 41 | `away_efg_factor` | Four Factors | FLOAT |
| 42 | `home_tov_factor` | Four Factors | FLOAT |
| 43 | `away_tov_factor` | Four Factors | FLOAT |
| 44 | `home_oreb_factor` | Four Factors | FLOAT |
| 45 | `away_oreb_factor` | Four Factors | FLOAT |
| 46 | `home_ft_factor` | Four Factors | FLOAT |
| 47 | `away_ft_factor` | Four Factors | FLOAT |
| 48 | `home_wins_last_5` | Form | INT |
| 49 | `away_wins_last_5` | Form | INT |
| 50 | `home_wins_last_10` | Form | INT |
| 51 | `away_wins_last_10` | Form | INT |
| 52 | `home_ats_last_10` | Form | INT |
| 53 | `away_ats_last_10` | Form | INT |
| 54 | `home_streak` | Form | INT |
| 55 | `away_streak` | Form | INT |
| 56 | `home_margin_avg_10` | Form | FLOAT |
| 57 | `away_margin_avg_10` | Form | FLOAT |
| 58 | `home_rest_days` | Rest | INT |
| 59 | `away_rest_days` | Rest | INT |
| 60 | `rest_advantage` | Rest | INT |
| 61 | `home_b2b` | Rest | INT |
| 62 | `away_b2b` | Rest | INT |
| 63 | `home_games_7d` | Rest | INT |
| 64 | `away_games_7d` | Rest | INT |
| 65 | `home_travel_miles` | Rest | INT |
| 66 | `away_travel_miles` | Rest | INT |
| 67 | `timezone_change` | Rest | INT |
| 68 | `h2h_home_wins` | H2H | INT |
| 69 | `h2h_away_wins` | H2H | INT |
| 70 | `h2h_home_ats` | H2H | INT |
| 71 | `h2h_avg_margin` | H2H | FLOAT |
| 72 | `h2h_avg_total` | H2H | FLOAT |
| 73 | `h2h_last_winner` | H2H | INT |
| 74 | `open_spread` | Lines | FLOAT |
| 75 | `current_spread` | Lines | FLOAT |
| 76 | `spread_movement` | Lines | FLOAT |
| 77 | `open_total` | Lines | FLOAT |
| 78 | `current_total` | Lines | FLOAT |
| 79 | `public_home_pct` | Lines | FLOAT |
| 80 | `sharp_money_pct` | Lines | FLOAT |
| 81 | `steam_move` | Lines | INT |
| 82 | `reverse_line_move` | Lines | INT |
| 83 | `pinnacle_spread` | Lines | FLOAT |
| 84 | `home_injury_score` | Injuries | FLOAT |
| 85 | `away_injury_score` | Injuries | FLOAT |
| 86 | `home_minutes_lost` | Injuries | FLOAT |
| 87 | `away_minutes_lost` | Injuries | FLOAT |
| 88 | `home_star_out` | Injuries | INT |
| 89 | `away_star_out` | Injuries | INT |
| 90 | `spread_pred_prob` | Predictions | FLOAT |
| 91 | `spread_pred_edge` | Predictions | FLOAT |
| 92 | `total_pred_prob` | Predictions | FLOAT |
| 93 | `total_pred_edge` | Predictions | FLOAT |
| 94 | `final_margin` | Outcomes | INT |
| 95 | `clv` | Outcomes | FLOAT |

---

**WNBA MASTER SHEET - 95 ENTERPRISE FEATURES**
