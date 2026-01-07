// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuthStore, useSettingsStore } from './store';
import { api } from './api/client';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Predictions from './pages/Predictions/Predictions';
import Betting from './pages/Betting/Betting';
import Analytics from './pages/Analytics/Analytics';
import Models from './pages/Models/Models';
import Backtesting from './pages/Backtesting/Backtesting';
import Settings from './pages/Settings/Settings';
import Login from './pages/Auth/Login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const ProtectedRoute: React.FC = () => {
  const { token, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = React.useState(false);
  
  // Mark as hydrated after a brief moment to allow Zustand to hydrate
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  
  // Check authentication - check localStorage directly since we know it has the data
  // This is more reliable than waiting for Zustand to hydrate
  const checkAuthentication = (): boolean => {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (!stored) {
        return false;
      }
      
      const parsed = JSON.parse(stored);
      // Check if we have both token and user in the stored state
      if (parsed.state?.token && parsed.state?.user) {
        return true;
      }
    } catch (e) {
      console.error('Error checking auth-storage:', e);
    }
    
    return false;
  };
  
  const isAuthenticated = checkAuthentication();
  
  // Get token from localStorage (source of truth)
  const authToken = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.state?.token || null;
      }
    } catch (e) {
      // Ignore parse errors
    }
    return null;
  }, []);
  
  // Sync token to API client when authenticated
  React.useEffect(() => {
    if (isAuthenticated && authToken) {
      api.setToken(authToken);
    } else {
      api.clearToken();
    }
  }, [isAuthenticated, authToken]);
  
  // Debug logging
  React.useEffect(() => {
    if (isHydrated) {
      const stored = localStorage.getItem('auth-storage');
      let parsedData = null;
      try {
        if (stored) {
          parsedData = JSON.parse(stored);
        }
      } catch (e) {
        // Ignore
      }
      
      console.log('ProtectedRoute - Auth check:', {
        hasAuthStorage: !!stored,
        isAuthenticated,
        isHydrated,
        storeToken: !!token,
        storeUser: !!user,
        authToken: !!authToken,
        localStorageState: parsedData?.state || null
      });
    }
  }, [isAuthenticated, isHydrated, token, user, authToken]);
  
  // Show nothing while waiting for hydration check
  if (!isHydrated) {
    return null;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Authenticated - allow access
  return <Outlet />;
};

const App: React.FC = () => {
  const { theme: themeMode } = useSettingsStore();
  
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#4caf50',
          },
          background: {
            default: themeMode === 'dark' ? '#121212' : '#f5f5f5',
            paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: themeMode === 'dark' 
                  ? '0 4px 6px rgba(0, 0, 0, 0.3)'
                  : '0 4px 6px rgba(0, 0, 0, 0.1)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
              },
            },
          },
        },
      }),
    [themeMode]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/predictions" element={<Predictions />} />
                  <Route path="/betting" element={<Betting />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/models" element={<Models />} />
                  <Route path="/backtesting" element={<Backtesting />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
