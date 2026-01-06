// src/pages/Betting/Betting.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Chip, Tab, Tabs, CircularProgress, Alert, LinearProgress
} from '@mui/material';
import {
  AccountBalance, TrendingUp, TrendingDown, Casino,
  Timeline, Assessment, AttachMoney
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import { api } from '../../api/client';
import { useBankrollStore } from '../../store';

interface BetRecord {
  id: string;
  prediction_id: string;
  sport: string;
  game: string;
  bet_type: string;
  pick: string;
  stake: number;
  odds: number;
  status: string;
  result?: string;
  profit?: number;
  clv?: number;
  placed_at: string;
}

interface CLVData {
  average_clv: number;
  clv_by_sport: Record<string, number>;
  clv_by_tier: Record<string, number>;
  clv_trend: Array<{ date: string; clv: number }>;
  total_bets: number;
  positive_clv_rate: number;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
  subtitle?: string;
}> = ({ title, value, icon, trend, color = '#1976d2', subtitle }) => (
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
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
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
                {trend >= 0 ? '+' : ''}{trend.toFixed(2)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const Betting: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bets, setBets] = useState<BetRecord[]>([]);
  const [clvData, setClvData] = useState<CLVData | null>(null);
  const [bankrollHistory, setBankrollHistory] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const { bankroll, setBankroll } = useBankrollStore();

  useEffect(() => {
    loadBettingData();
  }, []);

  const loadBettingData = async () => {
    try {
      setLoading(true);
      const [bankrollData, betsData, clvAnalysis] = await Promise.all([
        api.getBankroll(),
        api.getBetHistory({ days: 30 }),
        api.getCLVAnalysis(30),
      ]);

      setBankroll(bankrollData);
      setBets(betsData.bets || []);
      setClvData(clvAnalysis);

      // Generate bankroll history from transactions
      const history = generateBankrollHistory(bankrollData, betsData.bets || []);
      setBankrollHistory(history);

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load betting data');
    } finally {
      setLoading(false);
    }
  };

  const generateBankrollHistory = (bankrollData: any, bets: BetRecord[]) => {
    const days = 30;
    const history = [];
    let currentValue = bankrollData.current;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Simulate historical values based on ROI trend
      const factor = 1 - (i * (bankrollData.roi || 0) / days / 100);
      history.push({
        date: dateStr,
        value: currentValue * factor,
        peak: bankrollData.peak * factor,
      });
    }

    return history;
  };

  const getClvColor = (clv: number): string => {
    if (clv >= 3) return '#4caf50';
    if (clv >= 2) return '#8bc34a';
    if (clv >= 1) return '#cddc39';
    if (clv >= 0) return '#ffeb3b';
    return '#f44336';
  };

  const getClvLabel = (clv: number): string => {
    if (clv >= 3) return 'Elite';
    if (clv >= 2) return 'Professional';
    if (clv >= 1) return 'Competent';
    if (clv >= 0) return 'Break-even';
    return 'Negative';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const drawdown = bankroll ? ((bankroll.peak - bankroll.current) / bankroll.peak) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Betting & Bankroll
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Bankroll Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current Bankroll"
            value={`$${(bankroll?.current || 0).toLocaleString()}`}
            icon={<AccountBalance sx={{ fontSize: 40 }} />}
            color="#1976d2"
            subtitle={`Initial: $${(bankroll?.initial || 0).toLocaleString()}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total ROI"
            value={`${(bankroll?.roi || 0).toFixed(2)}%`}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            trend={bankroll?.roi || 0}
            color={bankroll?.roi && bankroll.roi > 0 ? '#4caf50' : '#f44336'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Win Rate"
            value={`${(bankroll?.win_rate || 0).toFixed(1)}%`}
            icon={<Assessment sx={{ fontSize: 40 }} />}
            color={bankroll?.win_rate && bankroll.win_rate >= 55 ? '#4caf50' : '#ff9800'}
            subtitle={`${bets.filter(b => b.result === 'win').length}W - ${bets.filter(b => b.result === 'loss').length}L`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current Drawdown"
            value={`${drawdown.toFixed(2)}%`}
            icon={<TrendingDown sx={{ fontSize: 40 }} />}
            color={drawdown < 5 ? '#4caf50' : drawdown < 10 ? '#ff9800' : '#f44336'}
            subtitle={`Peak: $${(bankroll?.peak || 0).toLocaleString()}`}
          />
        </Grid>
      </Grid>

      {/* CLV Analysis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                CLV Performance
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h3" sx={{ color: getClvColor(clvData?.average_clv || 0) }}>
                  {clvData?.average_clv?.toFixed(2) || '0.00'}%
                </Typography>
                <Chip
                  label={getClvLabel(clvData?.average_clv || 0)}
                  sx={{
                    ml: 2,
                    backgroundColor: getClvColor(clvData?.average_clv || 0),
                    color: 'white',
                  }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Positive CLV Rate: {((clvData?.positive_clv_rate || 0) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Tracked Bets: {clvData?.total_bets || 0}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                CLV by Tier
              </Typography>
              {clvData?.clv_by_tier && Object.entries(clvData.clv_by_tier).map(([tier, clv]) => (
                <Box key={tier} display="flex" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ width: 60 }}>Tier {tier}:</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(Math.max((clv + 5) * 10, 0), 100)}
                    sx={{ flexGrow: 1, mx: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ width: 50, textAlign: 'right' }}>
                    {clv.toFixed(2)}%
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bankroll History (30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={bankrollHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 500', 'dataMax + 500']} />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Bankroll']} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#1976d2"
                    fill="#1976d2"
                    fillOpacity={0.3}
                    name="Current"
                  />
                  <Area
                    type="monotone"
                    dataKey="peak"
                    stroke="#4caf50"
                    fill="none"
                    strokeDasharray="5 5"
                    name="Peak"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bet History */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Bet History</Typography>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="All" />
              <Tab label="Open" />
              <Tab label="Settled" />
            </Tabs>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Sport</TableCell>
                  <TableCell>Game</TableCell>
                  <TableCell>Pick</TableCell>
                  <TableCell>Stake</TableCell>
                  <TableCell>Odds</TableCell>
                  <TableCell>CLV</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>P/L</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bets
                  .filter((bet) => {
                    if (tabValue === 1) return bet.status === 'open';
                    if (tabValue === 2) return bet.status === 'settled';
                    return true;
                  })
                  .slice(0, 20)
                  .map((bet) => (
                    <TableRow key={bet.id} hover>
                      <TableCell>
                        {new Date(bet.placed_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip label={bet.sport} size="small" />
                      </TableCell>
                      <TableCell>{bet.game}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {bet.pick}
                      </TableCell>
                      <TableCell>${bet.stake.toFixed(2)}</TableCell>
                      <TableCell>
                        {bet.odds > 0 ? '+' : ''}{bet.odds}
                      </TableCell>
                      <TableCell sx={{ color: getClvColor(bet.clv || 0) }}>
                        {bet.clv !== undefined ? `${bet.clv > 0 ? '+' : ''}${bet.clv.toFixed(2)}%` : '-'}
                      </TableCell>
                      <TableCell>
                        {bet.status === 'open' ? (
                          <Chip label="Open" size="small" color="warning" />
                        ) : bet.result === 'win' ? (
                          <Chip label="Won" size="small" color="success" />
                        ) : bet.result === 'loss' ? (
                          <Chip label="Lost" size="small" color="error" />
                        ) : (
                          <Chip label="Push" size="small" />
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: bet.profit && bet.profit > 0 ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        {bet.profit !== undefined
                          ? `${bet.profit >= 0 ? '+' : ''}$${bet.profit.toFixed(2)}`
                          : '-'}
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

export default Betting;
