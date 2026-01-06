// src/pages/Settings/Settings.tsx
import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  Switch, FormControlLabel, Divider, Alert, Slider, Select,
  MenuItem, FormControl, InputLabel, IconButton, InputAdornment,
  Tabs, Tab, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import {
  Save, Visibility, VisibilityOff, Notifications, Security,
  Palette, AttachMoney, Psychology, Api
} from '@mui/icons-material';
import { useSettingsStore, useAuthStore } from '../../store';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ py: 3 }}>
    {value === index && children}
  </Box>
);

const Settings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const { user } = useAuthStore();
  const {
    theme, notifications, autoRefresh, refreshInterval,
    setTheme, setNotifications, setAutoRefresh, setRefreshInterval
  } = useSettingsStore();

  // Betting settings (local state for demo)
  const [bettingSettings, setBettingSettings] = useState({
    kellyFraction: 0.25,
    maxBetPercent: 0.02,
    minEdge: 0.03,
    tierAMin: 0.65,
    tierBMin: 0.60,
    tierCMin: 0.55,
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    telegramAlerts: true,
    slackAlerts: false,
    tierAOnly: false,
    dailySummary: true,
    weeklyReport: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Settings
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Card>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<Palette />} label="Appearance" iconPosition="start" />
          <Tab icon={<AttachMoney />} label="Betting" iconPosition="start" />
          <Tab icon={<Notifications />} label="Notifications" iconPosition="start" />
          <Tab icon={<Psychology />} label="ML Models" iconPosition="start" />
          <Tab icon={<Security />} label="Security" iconPosition="start" />
          <Tab icon={<Api />} label="API" iconPosition="start" />
        </Tabs>

        <CardContent>
          {/* Appearance Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Theme</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={theme === 'dark'}
                      onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                    />
                  }
                  label="Dark Mode"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Auto Refresh</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                  }
                  label="Enable Auto Refresh"
                />
                {autoRefresh && (
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>
                      Refresh Interval: {refreshInterval / 1000}s
                    </Typography>
                    <Slider
                      value={refreshInterval}
                      onChange={(_, v) => setRefreshInterval(v as number)}
                      min={10000}
                      max={300000}
                      step={10000}
                      marks={[
                        { value: 30000, label: '30s' },
                        { value: 60000, label: '1m' },
                        { value: 300000, label: '5m' },
                      ]}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          {/* Betting Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>Kelly Criterion Settings</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography gutterBottom>
                  Kelly Fraction: {(bettingSettings.kellyFraction * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={bettingSettings.kellyFraction}
                  onChange={(_, v) => setBettingSettings({ ...bettingSettings, kellyFraction: v as number })}
                  min={0.1}
                  max={1}
                  step={0.05}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography gutterBottom>
                  Max Bet: {(bettingSettings.maxBetPercent * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={bettingSettings.maxBetPercent}
                  onChange={(_, v) => setBettingSettings({ ...bettingSettings, maxBetPercent: v as number })}
                  min={0.01}
                  max={0.1}
                  step={0.005}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography gutterBottom>
                  Min Edge: {(bettingSettings.minEdge * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={bettingSettings.minEdge}
                  onChange={(_, v) => setBettingSettings({ ...bettingSettings, minEdge: v as number })}
                  min={0}
                  max={0.1}
                  step={0.005}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>Signal Tier Thresholds</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography gutterBottom>
                  Tier A Minimum: {(bettingSettings.tierAMin * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={bettingSettings.tierAMin}
                  onChange={(_, v) => setBettingSettings({ ...bettingSettings, tierAMin: v as number })}
                  min={0.6}
                  max={0.8}
                  step={0.01}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography gutterBottom>
                  Tier B Minimum: {(bettingSettings.tierBMin * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={bettingSettings.tierBMin}
                  onChange={(_, v) => setBettingSettings({ ...bettingSettings, tierBMin: v as number })}
                  min={0.55}
                  max={0.7}
                  step={0.01}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography gutterBottom>
                  Tier C Minimum: {(bettingSettings.tierCMin * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={bettingSettings.tierCMin}
                  onChange={(_, v) => setBettingSettings({ ...bettingSettings, tierCMin: v as number })}
                  min={0.5}
                  max={0.6}
                  step={0.01}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>Alert Channels</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Email Alerts"
                  secondary="Receive alerts via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.emailAlerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      emailAlerts: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Telegram Alerts"
                  secondary="Receive alerts via Telegram bot"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.telegramAlerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      telegramAlerts: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Slack Alerts"
                  secondary="Receive alerts via Slack webhook"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.slackAlerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      slackAlerts: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>Alert Preferences</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Tier A Predictions Only"
                  secondary="Only notify for highest confidence predictions"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.tierAOnly}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      tierAOnly: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Daily Summary"
                  secondary="Receive daily performance summary"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.dailySummary}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      dailySummary: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Weekly Report"
                  secondary="Receive weekly performance report"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notificationSettings.weeklyReport}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      weeklyReport: e.target.checked
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </TabPanel>

          {/* ML Models Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>Model Training Configuration</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Primary Framework</InputLabel>
                  <Select defaultValue="meta_ensemble" label="Primary Framework">
                    <MenuItem value="meta_ensemble">Meta-Ensemble (Recommended)</MenuItem>
                    <MenuItem value="autogluon">AutoGluon Only</MenuItem>
                    <MenuItem value="h2o">H2O AutoML Only</MenuItem>
                    <MenuItem value="sklearn">Sklearn Ensemble</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Calibration Method</InputLabel>
                  <Select defaultValue="isotonic" label="Calibration Method">
                    <MenuItem value="isotonic">Isotonic Regression</MenuItem>
                    <MenuItem value="platt">Platt Scaling</MenuItem>
                    <MenuItem value="temperature">Temperature Scaling</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Walk-Forward Validation"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Generate SHAP Explanations"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>Change Password</Typography>
            <Grid container spacing={2} sx={{ maxWidth: 400 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained">Update Password</Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>Two-Factor Authentication</Typography>
            <FormControlLabel
              control={<Switch />}
              label="Enable 2FA"
            />
          </TabPanel>

          {/* API Tab */}
          <TabPanel value={tabValue} index={5}>
            <Typography variant="h6" gutterBottom>API Keys</Typography>
            <TextField
              fullWidth
              label="API Key"
              value=""
              type={showApiKey ? 'text' : 'password'}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Button variant="outlined" sx={{ mr: 1 }}>Regenerate Key</Button>
            <Button variant="outlined" color="error">Revoke Key</Button>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>External API Keys</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="TheOddsAPI Key"
                  type="password"
                  placeholder="Enter your API key"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Telegram Bot Token"
                  type="password"
                  placeholder="Enter your bot token"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Slack Webhook URL"
                  type="password"
                  placeholder="Enter webhook URL"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              size="large"
            >
              Save Settings
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
