# WTA MASTER SHEET - ENTERPRISE EDITION
## AI PRO SPORTS | 90 Features | Enterprise-Grade
### Version 3.0 | January 2026

---

## FEATURE SUMMARY: 90 TOTAL FEATURES

| Category | Count |
|----------|-------|
| Match Info | 10 |
| ELO Ratings | 12 |
| Serve Statistics | 14 |
| Return Statistics | 12 |
| Recent Form | 10 |
| Head-to-Head | 8 |
| Surface Performance | 8 |
| Tournament Context | 6 |
| Line Movement | 6 |
| Predictions | 2 |
| Outcomes | 2 |

---

## ALL 90 FEATURES

| # | Feature Name | Category | Type |
|---|--------------|----------|------|
| 1 | `match_id` | Match Info | STRING |
| 2 | `match_date` | Match Info | DATE |
| 3 | `match_time` | Match Info | TIME |
| 4 | `player1_name` | Match Info | STRING |
| 5 | `player2_name` | Match Info | STRING |
| 6 | `tournament` | Match Info | STRING |
| 7 | `surface` | Match Info | STRING |
| 8 | `indoor_outdoor` | Match Info | STRING |
| 9 | `round` | Match Info | STRING |
| 10 | `best_of` | Match Info | INT |
| 11 | `p1_elo` | ELO | FLOAT |
| 12 | `p2_elo` | ELO | FLOAT |
| 13 | `elo_diff` | ELO | FLOAT |
| 14 | `p1_surface_elo` | ELO | FLOAT |
| 15 | `p2_surface_elo` | ELO | FLOAT |
| 16 | `surface_elo_diff` | ELO | FLOAT |
| 17 | `p1_hard_elo` | ELO | FLOAT |
| 18 | `p2_hard_elo` | ELO | FLOAT |
| 19 | `p1_clay_elo` | ELO | FLOAT |
| 20 | `p2_clay_elo` | ELO | FLOAT |
| 21 | `p1_grass_elo` | ELO | FLOAT |
| 22 | `p2_grass_elo` | ELO | FLOAT |
| 23 | `p1_first_serve_pct` | Serve | FLOAT |
| 24 | `p2_first_serve_pct` | Serve | FLOAT |
| 25 | `p1_first_serve_won_pct` | Serve | FLOAT |
| 26 | `p2_first_serve_won_pct` | Serve | FLOAT |
| 27 | `p1_second_serve_won_pct` | Serve | FLOAT |
| 28 | `p2_second_serve_won_pct` | Serve | FLOAT |
| 29 | `p1_ace_rate` | Serve | FLOAT |
| 30 | `p2_ace_rate` | Serve | FLOAT |
| 31 | `p1_df_rate` | Serve | FLOAT |
| 32 | `p2_df_rate` | Serve | FLOAT |
| 33 | `p1_bp_saved_pct` | Serve | FLOAT |
| 34 | `p2_bp_saved_pct` | Serve | FLOAT |
| 35 | `p1_hold_pct` | Serve | FLOAT |
| 36 | `p2_hold_pct` | Serve | FLOAT |
| 37 | `p1_return_pts_won` | Return | FLOAT |
| 38 | `p2_return_pts_won` | Return | FLOAT |
| 39 | `p1_first_return_won_pct` | Return | FLOAT |
| 40 | `p2_first_return_won_pct` | Return | FLOAT |
| 41 | `p1_second_return_won_pct` | Return | FLOAT |
| 42 | `p2_second_return_won_pct` | Return | FLOAT |
| 43 | `p1_bp_converted_pct` | Return | FLOAT |
| 44 | `p2_bp_converted_pct` | Return | FLOAT |
| 45 | `p1_break_pct` | Return | FLOAT |
| 46 | `p2_break_pct` | Return | FLOAT |
| 47 | `p1_tiebreak_win_pct` | Return | FLOAT |
| 48 | `p2_tiebreak_win_pct` | Return | FLOAT |
| 49 | `p1_wins_last_10` | Form | INT |
| 50 | `p2_wins_last_10` | Form | INT |
| 51 | `p1_wins_last_20` | Form | INT |
| 52 | `p2_wins_last_20` | Form | INT |
| 53 | `p1_streak` | Form | INT |
| 54 | `p2_streak` | Form | INT |
| 55 | `p1_sets_won_last_10` | Form | INT |
| 56 | `p2_sets_won_last_10` | Form | INT |
| 57 | `p1_days_since_match` | Form | INT |
| 58 | `p2_days_since_match` | Form | INT |
| 59 | `h2h_p1_wins` | H2H | INT |
| 60 | `h2h_p2_wins` | H2H | INT |
| 61 | `h2h_p1_surface_wins` | H2H | INT |
| 62 | `h2h_p2_surface_wins` | H2H | INT |
| 63 | `h2h_last_5_p1` | H2H | INT |
| 64 | `h2h_last_5_p2` | H2H | INT |
| 65 | `h2h_sets_diff` | H2H | INT |
| 66 | `h2h_last_winner` | H2H | INT |
| 67 | `p1_surface_win_pct` | Surface | FLOAT |
| 68 | `p2_surface_win_pct` | Surface | FLOAT |
| 69 | `p1_surface_matches` | Surface | INT |
| 70 | `p2_surface_matches` | Surface | INT |
| 71 | `p1_indoor_win_pct` | Surface | FLOAT |
| 72 | `p2_indoor_win_pct` | Surface | FLOAT |
| 73 | `p1_outdoor_win_pct` | Surface | FLOAT |
| 74 | `p2_outdoor_win_pct` | Surface | FLOAT |
| 75 | `tournament_level` | Tournament | STRING |
| 76 | `round_number` | Tournament | INT |
| 77 | `p1_tournament_history` | Tournament | FLOAT |
| 78 | `p2_tournament_history` | Tournament | FLOAT |
| 79 | `p1_ranking` | Tournament | INT |
| 80 | `p2_ranking` | Tournament | INT |
| 81 | `open_ml_p1` | Lines | INT |
| 82 | `current_ml_p1` | Lines | INT |
| 83 | `public_p1_pct` | Lines | FLOAT |
| 84 | `sharp_money_pct` | Lines | FLOAT |
| 85 | `steam_move` | Lines | INT |
| 86 | `pinnacle_ml` | Lines | INT |
| 87 | `p1_win_prob` | Predictions | FLOAT |
| 88 | `p1_edge` | Predictions | FLOAT |
| 89 | `winner` | Outcomes | INT |
| 90 | `clv` | Outcomes | FLOAT |

---

**WTA MASTER SHEET - 90 ENTERPRISE FEATURES**
