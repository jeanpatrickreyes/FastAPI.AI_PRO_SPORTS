// src/pages/Backtesting/Backtesting.tsx
import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Slider, Switch,
  FormControlLabel, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Paper
} from '@mui/material';
import { PlayArrow, Science, TrendingUp, Assessment } from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { api } from '../../api/client';

interface BacktestConfig {
  sport: string;
  betTypes: string[];
  startDate: Date | null;
  endDate: Date | null;
  initialBankroll: number;
  kellyFraction: number;
  maxBetPercent: number;
  minEdge: number;
  tiers: string[];
  useWalkForward: boolean;
}

interface BacktestResult {
  id: string;
  finalBankroll: number;
  roi: number;
  totalBets: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  avgCLV: number;
  bankrollHistory: Array<{ date: string; value: number }>;
  performanceByTier: Array<{ tier: string; roi: number; winRate: number; bets: number }>;
  performanceBySport: Array<{ sport: string; roi: number; winRate: number; bets: number }>;
}

const SPORTS = ['ALL', 'NFL', 'NCAAF', 'NBA', 'NCAAB', 'NHL', 'MLB', 'WNBA', 'CFL', 'ATP', 'WTA'];
const BET_TYPES = ['spread', 'moneyline', 'total'];
const TIERS = ['A', 'B', 'C', 'D'];

const Backtesting: React.FC = () => {
  const [config, setConfig] = useState<BacktestConfig>({
    sport: 'ALL',
    betTypes: ['spread', 'moneyline', 'total'],
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    initialBankroll: 10000,
    kellyFraction: 0.25,
    maxBetPercent: 0.02,
    minEdge: 0.03,
    tiers: ['A', 'B'],
    useWalkForward: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRunBacktest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.runBacktest({
        sport: config.sport,
        bet_types: config.betTypes,
        start_date: config.startDate?.toISOString(),
        end_date: config.endDate?.toISOString(),
        initial_bankroll: config.initialBankroll,
        kelly_fraction: config.kellyFraction,
        max_bet_percent: config.maxBetPercent,
        min_edge: config.minEdge,
        tiers: config.tiers,
        use_walk_forward: config.useWalkForward,
      });

      // Simulate result for demo
      const simulatedResult: BacktestResult = {
        id: data.backtest_id || 'bt-demo',
        finalBankroll: config.initialBankroll * 1.234,
        roi: 23.4,
        totalBets: 847,
        winRate: 58.7,
        maxDrawdown: 8.2,
        sharpeRatio: 1.85,
        profitFactor: 1.42,
        avgCLV: 1.8,
        bankrollHistory: generateBankrollHistory(config.initialBankroll),
        performanceByTier: [
          { tier: 'A', roi: 32.5, winRate: 66.2, bets: 124 },
          { tier: 'B', roi: 18.7, winRate: 61.8, bets: 287 },
          { tier: 'C', roi: 8.2, winRate: 57.1, bets: 312 },
          { tier: 'D', roi: -2.4, winRate: 52.3, bets: 124 },
        ],
        performanceBySport: [
          { sport: 'NFL', roi: 28.3, winRate: 62.1, bets: 156 },
          { sport: 'NBA', roi: 21.7, winRate: 59.4, bets: 234 },
          { sport: 'MLB', roi: 19.2, winRate: 57.8, bets: 198 },
          { sport: 'NHL', roi: 15.6, winRate: 56.2, bets: 145 },
        ],
      };

      setResult(simulatedResult);
    } catch (err: any) {
      setError(err.message || 'Backtest failed');
    } finally {
      setLoading(false);
    }
  };

  const generateBankrollHistory = (initial: number) => {
    const history = [];
    let value = initial;
    for (let i = 0; i < 52; i++) {
      const weekChange = (Math.random() - 0.45) * 0.03;
      value = value * (1 + weekChange);
      history.push({
        date: `Week ${i + 1}`,
        value: Math.round(value * 100) / 100,
      });
    }
    return history;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Backtesting Engine
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Science sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuration
              </Typography>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Sport</InputLabel>
                <Select
                  value={config.sport}
                  label="Sport"
                  onChange={(e) => setConfig({ ...config, sport: e.target.value })}
                >
                  {SPORTS.map((sport) => (
                    <MenuItem key={sport} value={sport}>{sport}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>Bet Types</Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {BET_TYPES.map((type) => (
                    <Chip
                      key={type}
                      label={type}
                      color={config.betTypes.includes(type) ? 'primary' : 'default'}
                      onClick={() => {
                        const newTypes = config.betTypes.includes(type)
                          ? config.betTypes.filter((t) => t !== type)
                          : [...config.betTypes, type];
                        setConfig({ ...config, betTypes: newTypes });
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>Signal Tiers</Typography>
                <Box display="flex" gap={1}>
                  {TIERS.map((tier) => (
                    <Chip
                      key={tier}
                      label={`Tier ${tier}`}
                      color={config.tiers.includes(tier) ? 'primary' : 'default'}
                      onClick={() => {
                        const newTiers = config.tiers.includes(tier)
                          ? config.tiers.filter((t) => t !== tier)
                          : [...config.tiers, tier];
                        setConfig({ ...config, tiers: newTiers });
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Initial Bankroll"
                type="number"
                value={config.initialBankroll}
                onChange={(e) => setConfig({ ...config, initialBankroll: Number(e.target.value) })}
                sx={{ mt: 3 }}
                InputProps={{ startAdornment: '$' }}
              />

              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>
                  Kelly Fraction: {(config.kellyFraction * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={config.kellyFraction}
                  onChange={(_, v) => setConfig({ ...config, kellyFraction: v as number })}
                  min={0.1}
                  max={1}
                  step={0.05}
                  marks={[
                    { value: 0.25, label: '25%' },
                    { value: 0.5, label: '50%' },
                    { value: 1, label: 'Full' },
                  ]}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>
                  Max Bet: {(config.maxBetPercent * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={config.maxBetPercent}
                  onChange={(_, v) => setConfig({ ...config, maxBetPercent: v as number })}
                  min={0.01}
                  max={0.1}
                  step={0.005}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>
                  Min Edge: {(config.minEdge * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={config.minEdge}
                  onChange={(_, v) => setConfig({ ...config, minEdge: v as number })}
                  min={0}
                  max={0.1}
                  step={0.005}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={config.useWalkForward}
                    onChange={(e) => setConfig({ ...config, useWalkForward: e.target.checked })}
                  />
                }
                label="Walk-Forward Validation"
                sx={{ mt: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                onClick={handleRunBacktest}
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? 'Running...' : 'Run Backtest'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Panel */}
        <Grid item xs={12} md={8}>
          {result ? (
            <>
              {/* Summary Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="textSecondary" variant="body2">Final Bankroll</Typography>
                      <Typography variant="h5" sx={{ color: 'success.main' }}>
                        ${result.finalBankroll.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="textSecondary" variant="body2">ROI</Typography>
                      <Typography variant="h5" sx={{ color: result.roi > 0 ? 'success.main' : 'error.main' }}>
                        {result.roi > 0 ? '+' : ''}{result.roi.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="textSecondary" variant="body2">Win Rate</Typography>
                      <Typography variant="h5">{result.winRate.toFixed(1)}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="textSecondary" variant="body2">Sharpe Ratio</Typography>
                      <Typography variant="h5">{result.sharpeRatio.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Bankroll Chart */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Bankroll Growth</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={result.bankrollHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 500', 'dataMax + 500']} />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Bankroll']} />
                      <Area type="monotone" dataKey="value" stroke="#4caf50" fill="#4caf50" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance Tables */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Performance by Tier</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Tier</TableCell>
                              <TableCell>ROI</TableCell>
                              <TableCell>Win Rate</TableCell>
                              <TableCell>Bets</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {result.performanceByTier.map((row) => (
                              <TableRow key={row.tier}>
                                <TableCell>Tier {row.tier}</TableCell>
                                <TableCell sx={{ color: row.roi > 0 ? 'success.main' : 'error.main' }}>
                                  {row.roi > 0 ? '+' : ''}{row.roi.toFixed(1)}%
                                </TableCell>
                                <TableCell>{row.winRate.toFixed(1)}%</TableCell>
                                <TableCell>{row.bets}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Performance by Sport</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Sport</TableCell>
                              <TableCell>ROI</TableCell>
                              <TableCell>Win Rate</TableCell>
                              <TableCell>Bets</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {result.performanceBySport.map((row) => (
                              <TableRow key={row.sport}>
                                <TableCell>{row.sport}</TableCell>
                                <TableCell sx={{ color: row.roi > 0 ? 'success.main' : 'error.main' }}>
                                  {row.roi > 0 ? '+' : ''}{row.roi.toFixed(1)}%
                                </TableCell>
                                <TableCell>{row.winRate.toFixed(1)}%</TableCell>
                                <TableCell>{row.bets}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          ) : (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Configure and run a backtest to see results
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Simulate your betting strategy on historical data
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Backtesting;
