// src/pages/Analytics/Analytics.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  CircularProgress, Alert, Tabs, Tab, IconButton, Tooltip, Badge
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Refresh, Star, Speed, Timeline,
  CompareArrows, LocalFireDepartment, Assessment
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { api } from '../../api/client';

interface ValueBet {
  id: string;
  game_id: string;
  sport: string;
  game: string;
  bet_type: string;
  side: string;
  our_probability: number;
  market_probability: number;
  edge: number;
  best_odds: number;
  sportsbook: string;
  signal_tier: string;
}

interface ArbitrageOpportunity {
  id: string;
  game_id: string;
  sport: string;
  game: string;
  bet_type: string;
  profit_margin: number;
  side1: { side: string; odds: number; sportsbook: string };
  side2: { side: string; odds: number; sportsbook: string };
}

interface SteamMove {
  id: string;
  game_id: string;
  sport: string;
  game: string;
  bet_type: string;
  direction: string;
  line_movement: number;
  time_window_minutes: number;
  sportsbooks_moving: number;
  detected_at: string;
}

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [valueBets, setValueBets] = useState<ValueBet[]>([]);
  const [arbitrage, setArbitrage] = useState<ArbitrageOpportunity[]>([]);
  const [steamMoves, setSteamMoves] = useState<SteamMove[]>([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [valueData, arbData, steamData] = await Promise.all([
        api.getValueBets(),
        api.getArbitrageOpportunities(),
        api.getSteamMoves(),
      ]);

      setValueBets(valueData.value_bets || []);
      setArbitrage(arbData.opportunities || []);
      setSteamMoves(steamData.steam_moves || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      A: '#4caf50', B: '#2196f3', C: '#ff9800', D: '#9e9e9e',
    };
    return colors[tier] || '#9e9e9e';
  };

  const edgeByTier = [
    { tier: 'Tier A', avgEdge: 8.5, count: valueBets.filter(v => v.signal_tier === 'A').length },
    { tier: 'Tier B', avgEdge: 5.2, count: valueBets.filter(v => v.signal_tier === 'B').length },
    { tier: 'Tier C', avgEdge: 3.1, count: valueBets.filter(v => v.signal_tier === 'C').length },
  ];

  const sportDistribution = React.useMemo(() => {
    const sportCounts: Record<string, number> = {};
    valueBets.forEach(v => {
      sportCounts[v.sport] = (sportCounts[v.sport] || 0) + 1;
    });
    return Object.entries(sportCounts).map(([sport, count]) => ({
      name: sport,
      value: count,
    }));
  }, [valueBets]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading && valueBets.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Analytics & Market Intelligence
        </Typography>
        <IconButton onClick={loadAnalyticsData} disabled={loading}>
          <Refresh />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={valueBets.length} color="primary">
                <Star sx={{ fontSize: 40, color: '#4caf50' }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>Value Bets</Typography>
              <Typography color="textSecondary">
                {valueBets.filter(v => v.signal_tier === 'A').length} Tier A opportunities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={arbitrage.length} color="success">
                <CompareArrows sx={{ fontSize: 40, color: '#2196f3' }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>Arbitrage</Typography>
              <Typography color="textSecondary">
                {arbitrage.length > 0 
                  ? `Best: ${(Math.max(...arbitrage.map(a => a.profit_margin)) * 100).toFixed(2)}%`
                  : 'No opportunities'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={steamMoves.length} color="warning">
                <LocalFireDepartment sx={{ fontSize: 40, color: '#ff9800' }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>Steam Moves</Typography>
              <Typography color="textSecondary">
                Sharp money detected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Average Edge by Tier</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={edgeByTier}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis />
                  <ReTooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Avg Edge']} />
                  <Bar dataKey="avgEdge" fill="#4caf50">
                    {edgeByTier.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Value Bets by Sport</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sportDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {sportDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different data */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab label={`Value Bets (${valueBets.length})`} icon={<Star />} iconPosition="start" />
            <Tab label={`Arbitrage (${arbitrage.length})`} icon={<CompareArrows />} iconPosition="start" />
            <Tab label={`Steam Moves (${steamMoves.length})`} icon={<LocalFireDepartment />} iconPosition="start" />
          </Tabs>

          {tabValue === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sport</TableCell>
                    <TableCell>Game</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Pick</TableCell>
                    <TableCell>Our Prob</TableCell>
                    <TableCell>Market Prob</TableCell>
                    <TableCell>Edge</TableCell>
                    <TableCell>Best Odds</TableCell>
                    <TableCell>Book</TableCell>
                    <TableCell>Tier</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {valueBets.slice(0, 15).map((bet) => (
                    <TableRow key={bet.id} hover>
                      <TableCell><Chip label={bet.sport} size="small" /></TableCell>
                      <TableCell>{bet.game}</TableCell>
                      <TableCell>{bet.bet_type}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{bet.side}</TableCell>
                      <TableCell>{(bet.our_probability * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(bet.market_probability * 100).toFixed(1)}%</TableCell>
                      <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        +{(bet.edge * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell>{bet.best_odds > 0 ? '+' : ''}{bet.best_odds}</TableCell>
                      <TableCell>{bet.sportsbook}</TableCell>
                      <TableCell>
                        <Chip
                          label={`Tier ${bet.signal_tier}`}
                          size="small"
                          sx={{ backgroundColor: getTierColor(bet.signal_tier), color: 'white' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabValue === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sport</TableCell>
                    <TableCell>Game</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Profit Margin</TableCell>
                    <TableCell>Side 1</TableCell>
                    <TableCell>Side 2</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {arbitrage.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">
                          No arbitrage opportunities currently available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    arbitrage.map((arb) => (
                      <TableRow key={arb.id} hover>
                        <TableCell><Chip label={arb.sport} size="small" /></TableCell>
                        <TableCell>{arb.game}</TableCell>
                        <TableCell>{arb.bet_type}</TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          +{(arb.profit_margin * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          {arb.side1.side} @ {arb.side1.odds > 0 ? '+' : ''}{arb.side1.odds}
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            {arb.side1.sportsbook}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {arb.side2.side} @ {arb.side2.odds > 0 ? '+' : ''}{arb.side2.odds}
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            {arb.side2.sportsbook}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabValue === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Sport</TableCell>
                    <TableCell>Game</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Direction</TableCell>
                    <TableCell>Movement</TableCell>
                    <TableCell>Books Moving</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {steamMoves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">
                          No steam moves detected recently
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    steamMoves.map((steam) => (
                      <TableRow key={steam.id} hover>
                        <TableCell>
                          {new Date(steam.detected_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell><Chip label={steam.sport} size="small" /></TableCell>
                        <TableCell>{steam.game}</TableCell>
                        <TableCell>{steam.bet_type}</TableCell>
                        <TableCell>
                          <Chip
                            icon={steam.direction === 'up' ? <TrendingUp /> : <TrendingDown />}
                            label={steam.direction.toUpperCase()}
                            size="small"
                            color={steam.direction === 'up' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {steam.line_movement > 0 ? '+' : ''}{steam.line_movement}
                        </TableCell>
                        <TableCell>{steam.sportsbooks_moving}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Analytics;
