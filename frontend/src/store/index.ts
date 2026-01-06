// src/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Prediction {
  id: string;
  game_id: string;
  sport: string;
  bet_type: string;
  predicted_side: string;
  probability: number;
  signal_tier: string;
  edge: number;
  status: string;
  result?: string;
  created_at: string;
}

interface Bankroll {
  current: number;
  initial: number;
  peak: number;
  low: number;
  total_wagered: number;
  total_won: number;
  total_lost: number;
  roi: number;
  win_rate: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

interface PredictionState {
  predictions: Prediction[];
  todayPredictions: Prediction[];
  loading: boolean;
  error: string | null;
  setPredictions: (predictions: Prediction[]) => void;
  setTodayPredictions: (predictions: Prediction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface BankrollState {
  bankroll: Bankroll | null;
  setBankroll: (bankroll: Bankroll) => void;
}

interface FilterState {
  selectedSport: string;
  selectedTier: string;
  selectedBetType: string;
  dateRange: { start: string; end: string };
  setSelectedSport: (sport: string) => void;
  setSelectedTier: (tier: string) => void;
  setSelectedBetType: (betType: string) => void;
  setDateRange: (range: { start: string; end: string }) => void;
  resetFilters: () => void;
}

interface SettingsState {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotifications: (enabled: boolean) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);

export const usePredictionStore = create<PredictionState>((set) => ({
  predictions: [],
  todayPredictions: [],
  loading: false,
  error: null,
  setPredictions: (predictions) => set({ predictions }),
  setTodayPredictions: (predictions) => set({ todayPredictions: predictions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export const useBankrollStore = create<BankrollState>((set) => ({
  bankroll: null,
  setBankroll: (bankroll) => set({ bankroll }),
}));

export const useFilterStore = create<FilterState>((set) => ({
  selectedSport: 'all',
  selectedTier: 'all',
  selectedBetType: 'all',
  dateRange: { start: '', end: '' },
  setSelectedSport: (sport) => set({ selectedSport: sport }),
  setSelectedTier: (tier) => set({ selectedTier: tier }),
  setSelectedBetType: (betType) => set({ selectedBetType: betType }),
  setDateRange: (range) => set({ dateRange: range }),
  resetFilters: () => set({
    selectedSport: 'all',
    selectedTier: 'all',
    selectedBetType: 'all',
    dateRange: { start: '', end: '' },
  }),
}));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      notifications: true,
      autoRefresh: true,
      refreshInterval: 60000,
      setTheme: (theme) => set({ theme }),
      setNotifications: (enabled) => set({ notifications: enabled }),
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
    }),
    { name: 'settings-storage' }
  )
);
