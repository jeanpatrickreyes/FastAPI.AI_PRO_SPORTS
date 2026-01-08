// src/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Ensure we always use /api/v1 prefix
const envUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = envUrl 
  ? (envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`)
  : 'http://localhost:8000/api/v1';

// Debug: Log the API base URL
console.log('API Base URL:', API_BASE_URL);
console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL);

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    // Initialize token from localStorage if available
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken;
    }

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Don't redirect if it's a demo token - allow demo mode to work
          const isDemoToken = this.token === 'demo-token';
          
          if (!isDemoToken) {
            this.token = null;
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          // For demo token, just reject the error without redirecting
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Auth
  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    this.setToken(data.access_token);
    return data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    this.clearToken();
  }

  // Predictions
  async getPredictions(params?: { sport?: string; date?: string; tier?: string }) {
    const { data } = await this.client.get('/predictions', { params });
    return data;
  }

  async getPredictionsToday() {
    const { data } = await this.client.get('/predictions/today');
    return data;
  }

  async getPredictionsBySport(sportCode: string) {
    const { data } = await this.client.get(`/predictions/sport/${sportCode}`);
    return data;
  }

  async getPredictionStats(days: number = 30) {
    const { data } = await this.client.get('/predictions/stats', { params: { days } });
    return data;
  }

  // Games
  async getGames(params?: { sport?: string; date?: string }) {
    const { data } = await this.client.get('/games', { params });
    return data;
  }

  async getGameDetails(gameId: string) {
    const { data } = await this.client.get(`/games/${gameId}`);
    return data;
  }

  // Odds
  async getOdds(gameId: string) {
    const { data } = await this.client.get(`/odds/${gameId}`);
    return data;
  }

  async getBestOdds(gameId: string) {
    const { data } = await this.client.get(`/odds/best/${gameId}`);
    return data;
  }

  async refreshOdds(sport?: string) {
    const params = sport ? { sport } : {};
    const { data } = await this.client.post('/odds/refresh', null, { params });
    return data;
  }

  // Player Props
  async getPlayerProps(gameId: string) {
    const { data } = await this.client.get(`/player-props/${gameId}`);
    return data;
  }

  async getPlayerPropsByPlayer(playerId: string) {
    const { data } = await this.client.get(`/player-props/player/${playerId}`);
    return data;
  }

  // Betting & Bankroll
  async getBankroll() {
    const { data } = await this.client.get('/betting/bankroll');
    return data;
  }

  async getBetSizing(predictionId: string) {
    const { data } = await this.client.post('/betting/sizing', { prediction_id: predictionId });
    return data;
  }

  async placeBet(betData: any) {
    const { data } = await this.client.post('/betting/bet', betData);
    return data;
  }

  async getBetHistory(params?: { sport?: string; days?: number }) {
    const { data } = await this.client.get('/betting/history', { params });
    return data;
  }

  async getCLVAnalysis(days: number = 30) {
    const { data } = await this.client.get('/betting/clv', { params: { days } });
    return data;
  }

  // Analytics
  async getValueBets() {
    const { data } = await this.client.get('/analytics/value-bets');
    return data;
  }

  async getArbitrageOpportunities() {
    const { data } = await this.client.get('/analytics/arbitrage');
    return data;
  }

  async getLineMovements(gameId: string) {
    const { data } = await this.client.get(`/analytics/line-movements/${gameId}`);
    return data;
  }

  async getSteamMoves() {
    const { data } = await this.client.get('/analytics/steam-moves');
    return data;
  }

  // Backtesting
  async runBacktest(config: any) {
    const { data } = await this.client.post('/backtest/run', config);
    return data;
  }

  async getBacktestResults(backtestId: string) {
    const { data } = await this.client.get(`/backtest/${backtestId}`);
    return data;
  }

  // Reports
  async getDailyReport(date?: string) {
    const { data } = await this.client.get('/reports/daily', { params: { date } });
    return data;
  }

  async getWeeklyReport() {
    const { data } = await this.client.get('/reports/weekly');
    return data;
  }

  async getModelPerformance() {
    const { data } = await this.client.get('/reports/model-performance');
    return data;
  }

  // Health & Monitoring
  async getHealthStatus() {
    const { data } = await this.client.get('/health/detailed');
    return data;
  }

  async getSystemMetrics() {
    const { data } = await this.client.get('/monitoring/metrics');
    return data;
  }

  async getAlerts() {
    const { data } = await this.client.get('/monitoring/alerts');
    return data;
  }

  // Models
  async getModels() {
    const { data } = await this.client.get('/models');
    return data;
  }

  async getModelDetails(modelId: string) {
    const { data } = await this.client.get(`/models/${modelId}`);
    return data;
  }
}

export const api = new APIClient();
export default api;
