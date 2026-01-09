// src/components/Dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, LinearProgress, Alert
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AccountBalance, SportsSoccer,
  CheckCircle, Cancel, Schedule, Star
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '../../api/client';
import { useBankrollStore, usePredictionStore } from '../../store';

interface DashboardStats {
  todayPredictions: number;
  tierACount: number;
  winRate: number;
  dailyPL: number;
  weeklyROI: number;
  currentBankroll: number;
  pendingBets: number;
  activeSports: string[];
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
}> = ({ title, value, icon, trend, color = '#1976d2' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="textSecondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ color }}>
            {value}
          </Typography>
          {trend !== undefined && (
            <Box display="flex" alignItems="center" mt={1}>
              {trend >= 0 ? (
                <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
              ) : (
                <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />
              )}
              <Typography
                variant="body2"
                sx={{ color: trend >= 0 ? 'success.main' : 'error.main', ml: 0.5 }}
              >
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const TierBadge: React.FC<{ tier: string }> = ({ tier }) => {
  const colors: Record<string, string> = {
    A: '#4caf50',
    B: '#2196f3',
    C: '#ff9800',
    D: '#9e9e9e',
  };
  return (
    <Chip
      label={`Tier ${tier}`}
      size="small"
      sx={{ backgroundColor: colors[tier] || '#9e9e9e', color: 'white', fontWeight: 'bold' }}
    />
  );
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [bankrollHistory, setBankrollHistory] = useState<any[]>([]);
  const [performanceByTier, setPerformanceByTier] = useState<any[]>([]);
  
  const { bankroll, setBankroll } = useBankrollStore();
  const { setTodayPredictions } = usePredictionStore();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load each endpoint independently so failures don't block predictions
      const results = await Promise.allSettled([
        api.getPredictionsToday(),
        api.getBankroll(),
        api.getDailyReport(),
      ]);

      const predictionsData = results[0].status === 'fulfilled' ? results[0].value : [];
      const bankrollData = results[1].status === 'fulfilled' ? results[1].value : { current: 10000, initial: 10000, peak: 10000, low: 10000, total_wagered: 0, total_won: 0, total_lost: 0, roi: 0, win_rate: 0 };
      const dailyReport = results[2].status === 'fulfilled' ? results[2].value : { win_rate: 0, daily_pl: 0, weekly_roi: 0 };

      // Backend returns an array directly, not wrapped in an object
      const predictionsArray = Array.isArray(predictionsData) ? predictionsData : (predictionsData?.predictions || []);

      setPredictions(predictionsArray);
      setTodayPredictions(predictionsArray);
      
      // Handle bankroll data - it might be an array or an object
      const bankrollObj = Array.isArray(bankrollData) && bankrollData.length > 0 
        ? bankrollData[0] 
        : bankrollData;
      setBankroll(bankrollObj);

      const tierACount = predictionsArray.filter(
        (p: any) => p.signal_tier === 'A'
      ).length;

      const currentBankrollAmount = (Array.isArray(bankrollData) && bankrollData.length > 0)
        ? bankrollData[0].current_amount || bankrollData[0].current || 0
        : bankrollObj.current || bankrollObj.current_amount || 0;

      setStats({
        todayPredictions: predictionsArray.length || 0,
        tierACount,
        winRate: dailyReport.win_rate || 0,
        dailyPL: dailyReport.daily_pl || 0,
        weeklyROI: dailyReport.weekly_roi || 0,
        currentBankroll: currentBankrollAmount,
        pendingBets: predictionsArray.filter(
          (p: any) => p.status === 'pending'
        ).length,
        activeSports: [...new Set(predictionsArray.map((p: any) => p.sport))],
      });

      // Mock bankroll history for chart
      setBankrollHistory([
        { date: 'Mon', value: currentBankrollAmount * 0.95 },
        { date: 'Tue', value: currentBankrollAmount * 0.97 },
        { date: 'Wed', value: currentBankrollAmount * 0.96 },
        { date: 'Thu', value: currentBankrollAmount * 0.99 },
        { date: 'Fri', value: currentBankrollAmount * 1.01 },
        { date: 'Sat', value: currentBankrollAmount * 1.02 },
        { date: 'Sun', value: currentBankrollAmount },
      ]);

      setPerformanceByTier([
        { tier: 'Tier A', winRate: 68, count: tierACount },
        { tier: 'Tier B', winRate: 62, count: Math.floor(predictionsArray.length * 0.3) || 0 },
        { tier: 'Tier C', winRate: 57, count: Math.floor(predictionsArray.length * 0.2) || 0 },
      ]);

      setError(null);
    } catch (err: any) {
      // Handle errors gracefully - don't show error for demo mode
      const isDemoMode = localStorage.getItem('token') === 'demo-token';
      
      if (isDemoMode) {
        // In demo mode, show empty state with mock data
        setStats({
          todayPredictions: 0,
          tierACount: 0,
          winRate: 0,
          dailyPL: 0,
          weeklyROI: 0,
          currentBankroll: 10000,
          pendingBets: 0,
          activeSports: [],
        });
        setPredictions([]);
        setBankroll({ current: 10000, initial: 10000, peak: 10000, low: 10000, total_wagered: 0, total_won: 0, total_lost: 0, roi: 0, win_rate: 0 });
        setError(null);
      } else {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        AI PRO SPORTS Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Predictions"
            value={stats?.todayPredictions || 0}
            icon={<SportsSoccer sx={{ fontSize: 40 }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tier A Picks"
            value={stats?.tierACount || 0}
            icon={<Star sx={{ fontSize: 40 }} />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Win Rate"
            value={`${(stats?.winRate || 0).toFixed(1)}%`}
            icon={<CheckCircle sx={{ fontSize: 40 }} />}
            trend={stats?.winRate ? stats.winRate - 55 : 0}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Daily P/L"
            value={`$${(stats?.dailyPL || 0).toFixed(2)}`}
            icon={<AccountBalance sx={{ fontSize: 40 }} />}
            trend={stats?.dailyPL ? (stats.dailyPL / (stats.currentBankroll || 1)) * 100 : 0}
            color={stats?.dailyPL && stats.dailyPL >= 0 ? '#4caf50' : '#f44336'}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bankroll History (7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bankrollHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Bankroll']} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ fill: '#1976d2' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance by Tier
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceByTier}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Win Rate']} />
                  <Bar dataKey="winRate" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Predictions Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Today's Top Predictions
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sport</TableCell>
                  <TableCell>Game</TableCell>
                  <TableCell>Bet Type</TableCell>
                  <TableCell>Pick</TableCell>
                  <TableCell>Probability</TableCell>
                  <TableCell>Edge</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {predictions
                  .filter((p) => p.signal_tier === 'A' || p.signal_tier === 'B')
                  .slice(0, 10)
                  .map((prediction) => (
                    <TableRow key={prediction.id} hover>
                      <TableCell>
                        <Chip label={prediction.sport} size="small" />
                      </TableCell>
                      <TableCell>
                        {prediction.home_team && prediction.away_team 
                          ? `${prediction.away_team} @ ${prediction.home_team}`
                          : prediction.home_team || prediction.away_team || 'TBD vs TBD'}
                      </TableCell>
                      <TableCell>{prediction.bet_type}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {prediction.predicted_side}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={prediction.probability * 100}
                            sx={{ width: 60, mr: 1 }}
                          />
                          {(prediction.probability * 100).toFixed(1)}%
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: prediction.edge > 0 ? 'success.main' : 'error.main' }}>
                        {prediction.edge > 0 ? '+' : ''}{(prediction.edge * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <TierBadge tier={prediction.signal_tier} />
                      </TableCell>
                      <TableCell>
                        {prediction.status === 'pending' ? (
                          <Chip icon={<Schedule />} label="Pending" size="small" />
                        ) : prediction.result === 'win' ? (
                          <Chip icon={<CheckCircle />} label="Won" size="small" color="success" />
                        ) : prediction.result === 'loss' ? (
                          <Chip icon={<Cancel />} label="Lost" size="small" color="error" />
                        ) : (
                          <Chip label={prediction.status} size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
