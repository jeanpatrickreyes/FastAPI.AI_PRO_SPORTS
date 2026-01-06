// AI PRO SPORTS Custom React Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useAuthStore, usePredictionStore, useBankrollStore, useSettingsStore } from '@/store';
import type {
  Prediction,
  Bankroll,
  Bet,
  MLModel,
  BacktestConfig,
  BacktestResult,
  ValueBet,
  ArbitrageOpportunity,
  SteamMove,
  HealthStatus,
  Sport,
  BetType,
  SignalTier,
} from '@/types';

// ============ Auth Hooks ============

export function useAuth() {
  const { user, token, setAuth, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      queryClient.invalidateQueries();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });

  return {
    user,
    token,
    isAuthenticated: !!token,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isLoading,
    loginError: loginMutation.error,
  };
}

// ============ Prediction Hooks ============

export function usePredictions(filters?: {
  sport?: Sport;
  bet_type?: BetType;
  signal_tier?: SignalTier;
  status?: string;
}) {
  return useQuery({
    queryKey: ['predictions', filters],
    queryFn: () => api.getPredictions(filters),
    staleTime: 60000,
  });
}

export function useTodayPredictions() {
  return useQuery({
    queryKey: ['predictions', 'today'],
    queryFn: api.getTodayPredictions,
    staleTime: 60000,
  });
}

export function usePrediction(id: number) {
  return useQuery({
    queryKey: ['prediction', id],
    queryFn: () => api.getPrediction(id),
    enabled: !!id,
  });
}

// ============ Game Hooks ============

export function useGames(filters?: { sport?: Sport; date?: string }) {
  return useQuery({
    queryKey: ['games', filters],
    queryFn: () => api.getGames(filters),
    staleTime: 300000,
  });
}

export function useGame(id: number) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => api.getGame(id),
    enabled: !!id,
  });
}

// ============ Odds Hooks ============

export function useOdds(gameId: number) {
  return useQuery({
    queryKey: ['odds', gameId],
    queryFn: () => api.getOdds(gameId),
    enabled: !!gameId,
    refetchInterval: 60000,
  });
}

export function useBestOdds(gameId: number) {
  return useQuery({
    queryKey: ['bestOdds', gameId],
    queryFn: () => api.getBestOdds(gameId),
    enabled: !!gameId,
    refetchInterval: 60000,
  });
}

// ============ Bankroll Hooks ============

export function useBankroll() {
  const { setBankroll } = useBankrollStore();

  return useQuery({
    queryKey: ['bankroll'],
    queryFn: api.getBankroll,
    onSuccess: (data) => setBankroll(data),
  });
}

export function useBetHistory(filters?: { status?: string; sport?: Sport }) {
  return useQuery({
    queryKey: ['betHistory', filters],
    queryFn: () => api.getBetHistory(filters),
  });
}

export function usePlaceBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bet: { prediction_id: number; stake: number }) =>
      api.placeBet(bet),
    onSuccess: () => {
      queryClient.invalidateQueries(['bankroll']);
      queryClient.invalidateQueries(['betHistory']);
    },
  });
}

export function useBetSizing(predictionId: number) {
  return useQuery({
    queryKey: ['betSizing', predictionId],
    queryFn: () => api.getBetSizing(predictionId),
    enabled: !!predictionId,
  });
}

// ============ Analytics Hooks ============

export function useValueBets() {
  return useQuery({
    queryKey: ['valueBets'],
    queryFn: api.getValueBets,
    refetchInterval: 60000,
  });
}

export function useArbitrageOpportunities() {
  return useQuery({
    queryKey: ['arbitrage'],
    queryFn: api.getArbitrageOpportunities,
    refetchInterval: 60000,
  });
}

export function useSteamMoves() {
  return useQuery({
    queryKey: ['steamMoves'],
    queryFn: api.getSteamMoves,
    refetchInterval: 60000,
  });
}

export function useLineMovements(gameId: number) {
  return useQuery({
    queryKey: ['lineMovements', gameId],
    queryFn: () => api.getLineMovements(gameId),
    enabled: !!gameId,
  });
}

// ============ Model Hooks ============

export function useModels(filters?: { sport?: Sport; framework?: string }) {
  return useQuery({
    queryKey: ['models', filters],
    queryFn: () => api.getModels(filters),
  });
}

export function useModel(id: number) {
  return useQuery({
    queryKey: ['model', id],
    queryFn: () => api.getModel(id),
    enabled: !!id,
  });
}

export function useModelPerformance(modelId: number, days: number = 30) {
  return useQuery({
    queryKey: ['modelPerformance', modelId, days],
    queryFn: () => api.getModelPerformance(modelId, days),
    enabled: !!modelId,
  });
}

export function usePromoteModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modelId: number) => api.promoteModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries(['models']);
    },
  });
}

// ============ Backtesting Hooks ============

export function useBacktestHistory() {
  return useQuery({
    queryKey: ['backtestHistory'],
    queryFn: api.getBacktestHistory,
  });
}

export function useBacktestResult(id: number) {
  return useQuery({
    queryKey: ['backtest', id],
    queryFn: () => api.getBacktestResult(id),
    enabled: !!id,
  });
}

export function useRunBacktest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: BacktestConfig) => api.runBacktest(config),
    onSuccess: () => {
      queryClient.invalidateQueries(['backtestHistory']);
    },
  });
}

// ============ Player Props Hooks ============

export function usePlayerProps(gameId: number) {
  return useQuery({
    queryKey: ['playerProps', gameId],
    queryFn: () => api.getPlayerProps(gameId),
    enabled: !!gameId,
  });
}

export function usePlayerPropsByPlayer(playerId: number) {
  return useQuery({
    queryKey: ['playerProps', 'player', playerId],
    queryFn: () => api.getPlayerPropsByPlayer(playerId),
    enabled: !!playerId,
  });
}

// ============ Health & Monitoring Hooks ============

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchInterval: 30000,
  });
}

export function useDetailedHealth() {
  return useQuery({
    queryKey: ['health', 'detailed'],
    queryFn: api.getDetailedHealth,
    refetchInterval: 60000,
  });
}

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: api.getMetrics,
    refetchInterval: 60000,
  });
}

// ============ Report Hooks ============

export function useDailyReport(date?: string) {
  return useQuery({
    queryKey: ['report', 'daily', date],
    queryFn: () => api.getDailyReport(date),
  });
}

export function useWeeklyReport(weekStart?: string) {
  return useQuery({
    queryKey: ['report', 'weekly', weekStart],
    queryFn: () => api.getWeeklyReport(weekStart),
  });
}

// ============ Settings Hooks ============

export function useSettings() {
  const settings = useSettingsStore();
  const queryClient = useQueryClient();

  const updateSettingsMutation = useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
    },
  });

  return {
    settings,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isLoading,
  };
}

// ============ Auto-Refresh Hook ============

export function useAutoRefresh(
  callback: () => void,
  interval: number,
  enabled: boolean = true
) {
  const { autoRefresh, refreshInterval } = useSettingsStore();

  const effectiveInterval = autoRefresh && enabled ? (interval || refreshInterval * 1000) : null;

  return useQuery({
    queryKey: ['autoRefresh', callback.toString()],
    queryFn: async () => {
      callback();
      return null;
    },
    refetchInterval: effectiveInterval,
    enabled: autoRefresh && enabled,
  });
}

// ============ Pagination Hook ============

export function usePagination(initialPage: number = 1, initialPageSize: number = 20) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const goToPage = (newPage: number) => setPage(newPage);
  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const changePageSize = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return {
    page,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
  };
}

// Missing import
import { useState } from 'react';

export default {
  useAuth,
  usePredictions,
  useTodayPredictions,
  usePrediction,
  useGames,
  useGame,
  useOdds,
  useBestOdds,
  useBankroll,
  useBetHistory,
  usePlaceBet,
  useBetSizing,
  useValueBets,
  useArbitrageOpportunities,
  useSteamMoves,
  useLineMovements,
  useModels,
  useModel,
  useModelPerformance,
  usePromoteModel,
  useBacktestHistory,
  useBacktestResult,
  useRunBacktest,
  usePlayerProps,
  usePlayerPropsByPlayer,
  useHealth,
  useDetailedHealth,
  useMetrics,
  useDailyReport,
  useWeeklyReport,
  useSettings,
  useAutoRefresh,
  usePagination,
};
