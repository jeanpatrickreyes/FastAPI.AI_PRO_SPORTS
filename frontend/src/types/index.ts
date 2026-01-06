// AI PRO SPORTS Frontend TypeScript Types

// ============ Core Types ============

export type Sport = 'NFL' | 'NCAAF' | 'CFL' | 'NBA' | 'NCAAB' | 'WNBA' | 'NHL' | 'MLB' | 'ATP' | 'WTA';

export type BetType = 'spread' | 'moneyline' | 'total';

export type SignalTier = 'A' | 'B' | 'C' | 'D';

export type PredictionStatus = 'pending' | 'won' | 'lost' | 'push';

export type Framework = 'meta-ensemble' | 'autogluon' | 'h2o' | 'sklearn';

// ============ User Types ============

export interface User {
  id: number;
  email: string;
  username: string;
  role: 'admin' | 'user' | 'premium';
  created_at: string;
  is_active: boolean;
  has_2fa: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// ============ Prediction Types ============

export interface Prediction {
  id: number;
  game_id: number;
  sport: Sport;
  bet_type: BetType;
  predicted_side: string;
  probability: number;
  edge: number;
  signal_tier: SignalTier;
  line_at_prediction: number;
  odds_at_prediction: number;
  sha256_hash: string;
  created_at: string;
  status: PredictionStatus;
  result?: 'win' | 'loss' | 'push';
  profit_loss?: number;
  shap_factors?: ShapFactor[];
  game?: Game;
}

export interface ShapFactor {
  feature: string;
  value: number;
  impact: 'positive' | 'negative';
}

// ============ Game Types ============

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
  logo_url?: string;
  elo_rating: number;
}

export interface Game {
  id: number;
  external_id: string;
  sport: Sport;
  home_team: Team;
  away_team: Team;
  scheduled_time: string;
  status: 'scheduled' | 'in_progress' | 'final';
  home_score?: number;
  away_score?: number;
  venue?: string;
}

// ============ Odds Types ============

export interface Odds {
  id: number;
  game_id: number;
  sportsbook: string;
  spread_home: number;
  spread_away: number;
  spread_home_odds: number;
  spread_away_odds: number;
  moneyline_home: number;
  moneyline_away: number;
  total: number;
  over_odds: number;
  under_odds: number;
  recorded_at: string;
}

export interface BestOdds {
  game_id: number;
  spread: {
    home: { odds: number; book: string };
    away: { odds: number; book: string };
  };
  moneyline: {
    home: { odds: number; book: string };
    away: { odds: number; book: string };
  };
  total: {
    over: { odds: number; book: string };
    under: { odds: number; book: string };
  };
}

// ============ Betting Types ============

export interface Bankroll {
  id: number;
  user_id: number;
  initial_balance: number;
  current_balance: number;
  peak_balance: number;
  low_balance: number;
  total_wagered: number;
  total_won: number;
  total_lost: number;
  roi: number;
  win_rate: number;
  max_drawdown: number;
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: number;
  user_id: number;
  prediction_id: number;
  stake: number;
  odds: number;
  potential_payout: number;
  status: 'open' | 'won' | 'lost' | 'push';
  profit_loss?: number;
  clv?: number;
  closing_odds?: number;
  placed_at: string;
  settled_at?: string;
  prediction?: Prediction;
}

export interface BetSizing {
  recommended_stake: number;
  kelly_fraction: number;
  edge: number;
  max_bet_capped: boolean;
}

// ============ Analytics Types ============

export interface ValueBet {
  id: number;
  game_id: number;
  sport: Sport;
  bet_type: BetType;
  predicted_side: string;
  our_probability: number;
  market_probability: number;
  edge: number;
  best_odds: number;
  best_book: string;
  signal_tier: SignalTier;
  game?: Game;
}

export interface ArbitrageOpportunity {
  id: number;
  game_id: number;
  sport: Sport;
  bet_type: BetType;
  profit_margin: number;
  side1_odds: number;
  side1_book: string;
  side2_odds: number;
  side2_book: string;
  game?: Game;
}

export interface SteamMove {
  id: number;
  game_id: number;
  sport: Sport;
  bet_type: BetType;
  direction: 'up' | 'down';
  movement: number;
  books_moving: number;
  detected_at: string;
  game?: Game;
}

export interface LineMovement {
  game_id: number;
  bet_type: BetType;
  movements: {
    timestamp: string;
    line: number;
    odds: number;
    sportsbook: string;
  }[];
}

// ============ Model Types ============

export interface MLModel {
  id: number;
  sport: Sport;
  bet_type: BetType;
  framework: Framework;
  version: string;
  accuracy: number;
  auc_roc: number;
  log_loss: number;
  brier_score: number;
  ece: number;
  is_production: boolean;
  training_samples: number;
  feature_count: number;
  meta_weights?: {
    h2o: number;
    autogluon: number;
    sklearn: number;
  };
  trained_at: string;
  created_at: string;
}

export interface ModelPerformance {
  model_id: number;
  date: string;
  accuracy: number;
  auc_roc: number;
  predictions_made: number;
  correct_predictions: number;
}

// ============ Backtesting Types ============

export interface BacktestConfig {
  sport?: Sport;
  bet_types: BetType[];
  signal_tiers: SignalTier[];
  initial_bankroll: number;
  kelly_fraction: number;
  max_bet_percent: number;
  min_edge: number;
  start_date?: string;
  end_date?: string;
  walk_forward: boolean;
}

export interface BacktestResult {
  id: number;
  config: BacktestConfig;
  final_bankroll: number;
  roi: number;
  win_rate: number;
  total_bets: number;
  sharpe_ratio: number;
  max_drawdown: number;
  profit_factor: number;
  bankroll_history: { week: number; balance: number }[];
  performance_by_tier: {
    tier: SignalTier;
    roi: number;
    win_rate: number;
    bets: number;
  }[];
  performance_by_sport: {
    sport: Sport;
    roi: number;
    win_rate: number;
    bets: number;
  }[];
  created_at: string;
}

// ============ Player Props Types ============

export interface PlayerProp {
  id: number;
  game_id: number;
  player_id: number;
  player_name: string;
  team: string;
  prop_type: string;
  line: number;
  over_odds: number;
  under_odds: number;
  predicted_value: number;
  predicted_over_prob: number;
  edge: number;
  signal_tier: SignalTier;
  game?: Game;
}

// ============ Health Types ============

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    database: ComponentHealth;
    redis: ComponentHealth;
    ml_models: ComponentHealth;
    api: ComponentHealth;
    gpu?: ComponentHealth;
  };
  timestamp: string;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms?: number;
  message?: string;
}

// ============ Report Types ============

export interface DailyReport {
  date: string;
  predictions_made: number;
  predictions_graded: number;
  accuracy: number;
  roi: number;
  profit_loss: number;
  tier_breakdown: {
    tier: SignalTier;
    predictions: number;
    accuracy: number;
    roi: number;
  }[];
}

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  total_predictions: number;
  accuracy: number;
  roi: number;
  clv_average: number;
  best_sport: Sport;
  worst_sport: Sport;
  daily_breakdown: DailyReport[];
}

// ============ Settings Types ============

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    telegram: boolean;
    slack: boolean;
    tier_a_only: boolean;
    daily_summary: boolean;
    weekly_report: boolean;
  };
  betting: {
    kelly_fraction: number;
    max_bet_percent: number;
    min_edge: number;
    tier_thresholds: {
      a: number;
      b: number;
      c: number;
    };
  };
  ml: {
    primary_framework: Framework;
    calibration_method: 'isotonic' | 'platt' | 'temperature';
    walk_forward_enabled: boolean;
    shap_enabled: boolean;
  };
}

// ============ API Response Types ============

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
  errors?: Record<string, string[]>;
}

// ============ Chart Types ============

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}
