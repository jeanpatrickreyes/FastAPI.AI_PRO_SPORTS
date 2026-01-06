// src/pages/Models/Models.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Button,
  CircularProgress, Alert, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Tabs, Tab
} from '@mui/material';
import {
  Psychology, Refresh, CheckCircle, Schedule, Archive,
  TrendingUp, Info, PlayArrow, CloudUpload
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { api } from '../../api/client';

interface MLModel {
  id: string;
  sport: string;
  bet_type: string;
  framework: string;
  version: string;
  accuracy: number;
  auc_roc: number;
  log_loss: number;
  brier_score: number;
  ece: number;
  status: string;
  is_production: boolean;
  training_samples: number;
  feature_count: number;
  trained_at: string;
  meta_weights?: { h2o: number; autogluon: number; sklearn: number };
}

interface ModelPerformance {
  date: string;
  accuracy: number;
  auc: number;
}

const Models: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<MLModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await api.getModels();
      setModels(data.models || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case 'active': return 'success';
      case 'training': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getFrameworkColor = (framework: string): string => {
    const colors: Record<string, string> = {
      'meta_ensemble': '#9c27b0',
      'autogluon': '#2196f3',
      'h2o': '#4caf50',
      'sklearn': '#ff9800',
    };
    return colors[framework] || '#9e9e9e';
  };

  // Mock performance data
  const performanceHistory: ModelPerformance[] = [
    { date: 'Week 1', accuracy: 62.5, auc: 0.68 },
    { date: 'Week 2', accuracy: 63.8, auc: 0.69 },
    { date: 'Week 3', accuracy: 64.2, auc: 0.70 },
    { date: 'Week 4', accuracy: 65.1, auc: 0.71 },
    { date: 'Week 5', accuracy: 64.8, auc: 0.70 },
    { date: 'Week 6', accuracy: 66.2, auc: 0.72 },
  ];

  const radarData = selectedModel ? [
    { metric: 'Accuracy', value: selectedModel.accuracy * 100, fullMark: 100 },
    { metric: 'AUC-ROC', value: selectedModel.auc_roc * 100, fullMark: 100 },
    { metric: 'Calibration', value: (1 - selectedModel.ece) * 100, fullMark: 100 },
    { metric: 'Log Loss', value: (1 - selectedModel.log_loss) * 100, fullMark: 100 },
    { metric: 'Brier Score', value: (1 - selectedModel.brier_score) * 100, fullMark: 100 },
  ] : [];

  const stats = {
    total: models.length,
    production: models.filter(m => m.is_production).length,
    avgAccuracy: models.length > 0 
      ? models.reduce((acc, m) => acc + m.accuracy, 0) / models.length 
      : 0,
    frameworks: [...new Set(models.map(m => m.framework))].length,
  };

  if (loading && models.length === 0) {
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
          ML Models
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadModels}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<PlayArrow />}>
            Train New Model
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Psychology sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4">{stats.total}</Typography>
              <Typography color="textSecondary">Total Models</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4">{stats.production}</Typography>
              <Typography color="textSecondary">In Production</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4">{(stats.avgAccuracy * 100).toFixed(1)}%</Typography>
              <Typography color="textSecondary">Avg Accuracy</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CloudUpload sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4">{stats.frameworks}</Typography>
              <Typography color="textSecondary">Frameworks</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Model Performance Trend
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" domain={[55, 75]} />
              <YAxis yAxisId="right" orientation="right" domain={[0.6, 0.8]} />
              <ReTooltip />
              <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#4caf50" strokeWidth={2} name="Accuracy %" />
              <Line yAxisId="right" type="monotone" dataKey="auc" stroke="#2196f3" strokeWidth={2} name="AUC-ROC" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Models Table */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab label="All Models" />
            <Tab label="Production" />
            <Tab label="Meta-Ensemble" />
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sport</TableCell>
                  <TableCell>Bet Type</TableCell>
                  <TableCell>Framework</TableCell>
                  <TableCell>Accuracy</TableCell>
                  <TableCell>AUC-ROC</TableCell>
                  <TableCell>ECE</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Trained</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {models
                  .filter((model) => {
                    if (tabValue === 1) return model.is_production;
                    if (tabValue === 2) return model.framework === 'meta_ensemble';
                    return true;
                  })
                  .map((model) => (
                    <TableRow key={model.id} hover>
                      <TableCell>
                        <Chip label={model.sport} size="small" />
                      </TableCell>
                      <TableCell>{model.bet_type}</TableCell>
                      <TableCell>
                        <Chip
                          label={model.framework}
                          size="small"
                          sx={{ backgroundColor: getFrameworkColor(model.framework), color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={model.accuracy * 100}
                            sx={{ width: 60, mr: 1 }}
                            color={model.accuracy >= 0.65 ? 'success' : model.accuracy >= 0.60 ? 'warning' : 'error'}
                          />
                          {(model.accuracy * 100).toFixed(1)}%
                        </Box>
                      </TableCell>
                      <TableCell>{model.auc_roc.toFixed(3)}</TableCell>
                      <TableCell>{model.ece.toFixed(4)}</TableCell>
                      <TableCell>
                        <Chip
                          icon={model.is_production ? <CheckCircle /> : <Schedule />}
                          label={model.is_production ? 'Production' : model.status}
                          size="small"
                          color={model.is_production ? 'success' : getStatusColor(model.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(model.trained_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedModel(model);
                              setDetailsOpen(true);
                            }}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Model Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Model Details
          {selectedModel && (
            <Chip
              label={selectedModel.framework}
              size="small"
              sx={{ ml: 2, backgroundColor: getFrameworkColor(selectedModel.framework), color: 'white' }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedModel && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Configuration</Typography>
                <Typography>Sport: {selectedModel.sport}</Typography>
                <Typography>Bet Type: {selectedModel.bet_type}</Typography>
                <Typography>Version: {selectedModel.version}</Typography>
                <Typography>Training Samples: {selectedModel.training_samples.toLocaleString()}</Typography>
                <Typography>Features: {selectedModel.feature_count}</Typography>

                {selectedModel.meta_weights && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color="textSecondary">Meta-Ensemble Weights</Typography>
                    <Typography>H2O: {(selectedModel.meta_weights.h2o * 100).toFixed(1)}%</Typography>
                    <Typography>AutoGluon: {(selectedModel.meta_weights.autogluon * 100).toFixed(1)}%</Typography>
                    <Typography>Sklearn: {(selectedModel.meta_weights.sklearn * 100).toFixed(1)}%</Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Performance Metrics
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Model" dataKey="value" stroke="#1976d2" fill="#1976d2" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selectedModel && !selectedModel.is_production && (
            <Button variant="contained" color="primary">
              Promote to Production
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Models;
