// src/pages/Predictions/Predictions.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Select,
  MenuItem, FormControl, InputLabel, TextField, Button, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Alert, Tabs, Tab, CircularProgress, TablePagination
} from '@mui/material';
import {
  FilterList, Refresh, Info, TrendingUp, Casino, Schedule,
  CheckCircle, Cancel, Star, SportsSoccer, PlayArrow
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { api } from '../../api/client';
import { useFilterStore, useAuthStore } from '../../store';

const SPORTS = ['all', 'NFL', 'NCAAF', 'NBA', 'NCAAB', 'NHL', 'MLB', 'WNBA', 'CFL', 'ATP', 'WTA'];
const TIERS = ['all', 'A', 'B', 'C', 'D'];
const BET_TYPES = ['all', 'spread', 'moneyline', 'total'];

interface Prediction {
  id: string;
  game_id: string;
  sport: string;
  home_team: string;
  away_team: string;
  game_time: string;
  bet_type: string;
  predicted_side: string;
  line: number;
  odds: number;
  probability: number;
  edge: number;
  signal_tier: string;
  status: string;
  result?: string;
  profit?: number;
  shap_factors?: Array<{ feature: string; value: number; impact: string }>;
  prediction_hash: string;
}

interface PredictionDetailsProps {
  prediction: Prediction | null;
  open: boolean;
  onClose: () => void;
}

const PredictionDetails: React.FC<PredictionDetailsProps> = ({ prediction, open, onClose }) => {
  if (!prediction) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Prediction Details
        <Chip
          label={`Tier ${prediction.signal_tier}`}
          size="small"
          sx={{ ml: 2, backgroundColor: getTierColor(prediction.signal_tier), color: 'white' }}
        />
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Game</Typography>
            <Typography variant="body1" gutterBottom>
              {prediction.away_team} @ {prediction.home_team}
            </Typography>
            
            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Game Time</Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(prediction.game_time).toLocaleString()}
            </Typography>

            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Bet Type</Typography>
            <Typography variant="body1" gutterBottom>
              {prediction.bet_type.toUpperCase()}
            </Typography>

            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Pick</Typography>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              {prediction.predicted_side} {prediction.line !== 0 && `(${prediction.line > 0 ? '+' : ''}${prediction.line})`}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Probability</Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <LinearProgress
                variant="determinate"
                value={prediction.probability * 100}
                sx={{ flexGrow: 1, mr: 2, height: 10, borderRadius: 5 }}
              />
              <Typography variant="h6">{(prediction.probability * 100).toFixed(1)}%</Typography>
            </Box>

            <Typography variant="subtitle2" color="textSecondary">Edge</Typography>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: prediction.edge > 0 ? 'success.main' : 'error.main' }}
            >
              {prediction.edge > 0 ? '+' : ''}{(prediction.edge * 100).toFixed(2)}%
            </Typography>

            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Odds</Typography>
            <Typography variant="body1" gutterBottom>
              {prediction.odds > 0 ? '+' : ''}{prediction.odds}
            </Typography>

            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Hash (SHA-256)</Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {prediction.prediction_hash}
            </Typography>
          </Grid>

          {prediction.shap_factors && prediction.shap_factors.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Key Factors (SHAP Analysis)
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Factor</TableCell>
                      <TableCell align="right">Impact</TableCell>
                      <TableCell align="center">Direction</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prediction.shap_factors.slice(0, 10).map((factor, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{factor.feature.replace(/_/g, ' ')}</TableCell>
                        <TableCell align="right">{Math.abs(factor.value).toFixed(3)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={factor.impact}
                            size="small"
                            color={factor.impact === 'positive' ? 'success' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<Casino />}>
          Calculate Bet Size
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const getTierColor = (tier: string): string => {
  const colors: Record<string, string> = {
    A: '#4caf50',
    B: '#2196f3',
    C: '#ff9800',
    D: '#9e9e9e',
  };
  return colors[tier] || '#9e9e9e';
};

const Predictions: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [total, setTotal] = useState(0);

  const { user } = useAuthStore();
  // Check if user is admin - handle different role formats
  const userRole = user?.role?.toLowerCase() || '';
  // For now, show button to all authenticated users (can restrict later)
  const isAdmin = user !== null && (userRole === 'admin' || userRole === 'super_admin' || userRole === 'superadmin' || userRole.includes('admin') || !userRole);

  const {
    selectedSport, selectedTier, selectedBetType,
    setSelectedSport, setSelectedTier, setSelectedBetType, resetFilters
  } = useFilterStore();

  useEffect(() => {
    setPage(0); // Reset to first page when filters change
  }, [selectedSport, selectedBetType]); // Removed selectedTier - filtering client-side

  useEffect(() => {
    loadPredictions();
  }, [selectedSport, selectedBetType, page, rowsPerPage]); // Removed selectedTier - filtering client-side

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page + 1, // Backend uses 1-based pagination
        per_page: rowsPerPage
      };
      if (selectedSport !== 'all') params.sport = selectedSport;
      // Tier filtering is done client-side, not sent to API
      if (selectedBetType !== 'all') params.bet_type = selectedBetType;

      const data = await api.getPredictions(params);
      setPredictions(data.predictions || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (prediction: Prediction) => {
    setSelectedPrediction(prediction);
    setDetailsOpen(true);
  };

  const handleGeneratePredictions = async () => {
    try {
      setGenerating(true);
      setGenerateError(null);
      setGenerateSuccess(null);
      
      const params: any = {
        bet_types: ['spread', 'moneyline', 'total']
      };
      
      if (selectedSport && selectedSport !== 'all') {
        params.sport_code = selectedSport;
      }
      
      const result = await api.generatePredictions(params);
      
      setGenerateSuccess(
        `Successfully generated ${result.generated_count || 0} predictions!`
      );
      
      // Refresh predictions after generation
      setTimeout(() => {
        loadPredictions();
        setGenerateSuccess(null);
      }, 2000);
    } catch (err: any) {
      setGenerateError(err.response?.data?.detail || err.message || 'Failed to generate predictions');
    } finally {
      setGenerating(false);
    }
  };

  const filteredPredictions = predictions.filter((p) => {
    // Filter by tab (ALL/PENDING/GRADED)
    if (tabValue === 1) {
      if (p.status !== 'pending') return false;
    } else if (tabValue === 2) {
      if (p.status !== 'graded' && p.status !== 'win' && p.status !== 'loss' && p.status !== 'push') return false;
    }
    
    // Filter by tier (client-side filtering)
    if (selectedTier !== 'all' && p.signal_tier !== selectedTier) {
      return false;
    }
    
    return true;
  });

  const stats = {
    total: predictions.length,
    tierA: predictions.filter((p) => p.signal_tier === 'A').length,
    pending: predictions.filter((p) => p.status === 'pending').length,
    winRate: predictions.filter((p) => p.result === 'win').length /
      Math.max(predictions.filter((p) => p.status === 'graded').length, 1) * 100,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Predictions
        </Typography>
        <Box display="flex" gap={2}>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={generating ? <CircularProgress size={16} /> : <PlayArrow />}
              onClick={handleGeneratePredictions}
              disabled={generating || loading}
            >
              {generating ? 'Generating...' : 'Generate Predictions'}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadPredictions}
            disabled={loading || generating}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {generateError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setGenerateError(null)}>
          {generateError}
        </Alert>
      )}

      {generateSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setGenerateSuccess(null)}>
          {generateSuccess}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" variant="body2">Total</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" variant="body2">Tier A</Typography>
              <Typography variant="h4" sx={{ color: '#4caf50' }}>{stats.tierA}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" variant="body2">Pending</Typography>
              <Typography variant="h4" sx={{ color: '#ff9800' }}>{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" variant="body2">Win Rate</Typography>
              <Typography variant="h4" sx={{ color: stats.winRate >= 55 ? '#4caf50' : '#f44336' }}>
                {stats.winRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sport</InputLabel>
                <Select
                  value={selectedSport}
                  label="Sport"
                  onChange={(e) => setSelectedSport(e.target.value)}
                >
                  {SPORTS.map((sport) => (
                    <MenuItem key={sport} value={sport}>
                      {sport === 'all' ? 'All Sports' : sport}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tier</InputLabel>
                <Select
                  value={selectedTier}
                  label="Tier"
                  onChange={(e) => setSelectedTier(e.target.value)}
                >
                  {TIERS.map((tier) => (
                    <MenuItem key={tier} value={tier}>
                      {tier === 'all' ? 'All Tiers' : `Tier ${tier}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Bet Type</InputLabel>
                <Select
                  value={selectedBetType}
                  label="Bet Type"
                  onChange={(e) => setSelectedBetType(e.target.value)}
                >
                  {BET_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button fullWidth variant="outlined" onClick={resetFilters}>
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs and Pagination */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label={`All (${predictions.length})`} />
          <Tab label={`Pending (${stats.pending})`} />
          <Tab label={`Graded (${predictions.length - stats.pending})`} />
        </Tabs>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[25, 50, 100]}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
          showFirstButton
          showLastButton
        />
      </Box>

      {/* Predictions Table */}
      <Card>
        <TableContainer>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sport</TableCell>
                  <TableCell>Game</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Pick</TableCell>
                  <TableCell>Prob</TableCell>
                  <TableCell>Edge</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPredictions.map((prediction) => (
                  <TableRow key={prediction.id} hover>
                    <TableCell>
                      <Chip label={prediction.sport} size="small" />
                    </TableCell>
                    <TableCell>
                      {prediction.away_team} @ {prediction.home_team}
                    </TableCell>
                    <TableCell>
                      {new Date(prediction.game_time).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{prediction.bet_type}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {prediction.predicted_side}
                      {prediction.line !== 0 && ` (${prediction.line > 0 ? '+' : ''}${prediction.line})`}
                    </TableCell>
                    <TableCell>{(prediction.probability * 100).toFixed(1)}%</TableCell>
                    <TableCell sx={{ color: prediction.edge > 0 ? 'success.main' : 'error.main' }}>
                      {prediction.edge > 0 ? '+' : ''}{(prediction.edge * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`Tier ${prediction.signal_tier}`}
                        size="small"
                        sx={{ backgroundColor: getTierColor(prediction.signal_tier), color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>
                      {prediction.status === 'pending' ? (
                        <Chip icon={<Schedule />} label="Pending" size="small" />
                      ) : prediction.result === 'win' ? (
                        <Chip icon={<CheckCircle />} label="Won" size="small" color="success" />
                      ) : prediction.result === 'loss' ? (
                        <Chip icon={<Cancel />} label="Lost" size="small" color="error" />
                      ) : (
                        <Chip label="Push" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(prediction)}>
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPredictions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No predictions found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>

      <PredictionDetails
        prediction={selectedPrediction}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </Box>
  );
};

export default Predictions;
