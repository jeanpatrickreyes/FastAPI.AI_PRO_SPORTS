// AI PRO SPORTS Frontend Utility Functions

import type { SignalTier, Sport, BetType, PredictionStatus } from '@/types';

// ============ Formatting Utilities ============

/**
 * Format a number as currency
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format American odds
 */
export function formatOdds(odds: number): string {
  if (odds >= 0) {
    return `+${odds}`;
  }
  return odds.toString();
}

/**
 * Format a date string
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options || {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a time string
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

// ============ Color Utilities ============

/**
 * Get color for signal tier
 */
export function getTierColor(tier: SignalTier): string {
  const colors: Record<SignalTier, string> = {
    A: '#4caf50', // Green
    B: '#2196f3', // Blue
    C: '#ff9800', // Orange
    D: '#9e9e9e', // Grey
  };
  return colors[tier] || colors.D;
}

/**
 * Get background color for signal tier (lighter)
 */
export function getTierBgColor(tier: SignalTier): string {
  const colors: Record<SignalTier, string> = {
    A: 'rgba(76, 175, 80, 0.1)',
    B: 'rgba(33, 150, 243, 0.1)',
    C: 'rgba(255, 152, 0, 0.1)',
    D: 'rgba(158, 158, 158, 0.1)',
  };
  return colors[tier] || colors.D;
}

/**
 * Get color for CLV value
 */
export function getCLVColor(clv: number): string {
  if (clv >= 3) return '#2e7d32'; // Dark green
  if (clv >= 2) return '#4caf50'; // Green
  if (clv >= 1) return '#8bc34a'; // Light green
  if (clv >= 0) return '#ffc107'; // Yellow
  return '#f44336'; // Red
}

/**
 * Get color for profit/loss
 */
export function getProfitColor(value: number): string {
  if (value > 0) return '#4caf50';
  if (value < 0) return '#f44336';
  return '#9e9e9e';
}

/**
 * Get color for prediction status
 */
export function getStatusColor(status: PredictionStatus): string {
  const colors: Record<PredictionStatus, string> = {
    pending: '#ff9800',
    won: '#4caf50',
    lost: '#f44336',
    push: '#9e9e9e',
  };
  return colors[status] || colors.pending;
}

/**
 * Get color for ML framework
 */
export function getFrameworkColor(framework: string): string {
  const colors: Record<string, string> = {
    'meta-ensemble': '#9c27b0', // Purple
    autogluon: '#2196f3', // Blue
    h2o: '#4caf50', // Green
    sklearn: '#ff9800', // Orange
  };
  return colors[framework] || '#9e9e9e';
}

// ============ Calculation Utilities ============

/**
 * Convert American odds to decimal
 */
export function americanToDecimal(odds: number): number {
  if (odds > 0) {
    return (odds / 100) + 1;
  }
  return (100 / Math.abs(odds)) + 1;
}

/**
 * Convert decimal odds to American
 */
export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100);
  }
  return Math.round(-100 / (decimal - 1));
}

/**
 * Convert American odds to implied probability
 */
export function oddsToImpliedProb(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  }
  return Math.abs(odds) / (Math.abs(odds) + 100);
}

/**
 * Calculate edge given our probability and odds
 */
export function calculateEdge(probability: number, odds: number): number {
  const impliedProb = oddsToImpliedProb(odds);
  return probability - impliedProb;
}

/**
 * Calculate Kelly bet size
 */
export function calculateKelly(probability: number, odds: number, fraction: number = 0.25): number {
  const decimal = americanToDecimal(odds);
  const b = decimal - 1;
  const q = 1 - probability;
  const fullKelly = (b * probability - q) / b;
  return Math.max(0, fullKelly * fraction);
}

/**
 * Calculate potential payout
 */
export function calculatePayout(stake: number, odds: number): number {
  const decimal = americanToDecimal(odds);
  return stake * decimal;
}

/**
 * Calculate ROI
 */
export function calculateROI(profit: number, wagered: number): number {
  if (wagered === 0) return 0;
  return profit / wagered;
}

// ============ Validation Utilities ============

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: '' };
}

// ============ Sport Utilities ============

/**
 * Get sport display name
 */
export function getSportDisplayName(sport: Sport): string {
  const names: Record<Sport, string> = {
    NFL: 'NFL Football',
    NCAAF: 'College Football',
    CFL: 'CFL Football',
    NBA: 'NBA Basketball',
    NCAAB: 'College Basketball',
    WNBA: 'WNBA Basketball',
    NHL: 'NHL Hockey',
    MLB: 'MLB Baseball',
    ATP: 'ATP Tennis',
    WTA: 'WTA Tennis',
  };
  return names[sport] || sport;
}

/**
 * Get sport icon name (for MUI icons)
 */
export function getSportIcon(sport: Sport): string {
  const icons: Record<Sport, string> = {
    NFL: 'SportsFootball',
    NCAAF: 'SportsFootball',
    CFL: 'SportsFootball',
    NBA: 'SportsBasketball',
    NCAAB: 'SportsBasketball',
    WNBA: 'SportsBasketball',
    NHL: 'SportsHockey',
    MLB: 'SportsBaseball',
    ATP: 'SportsTennis',
    WTA: 'SportsTennis',
  };
  return icons[sport] || 'Sports';
}

/**
 * Get bet type display name
 */
export function getBetTypeDisplayName(betType: BetType): string {
  const names: Record<BetType, string> = {
    spread: 'Spread',
    moneyline: 'Moneyline',
    total: 'Total',
  };
  return names[betType] || betType;
}

// ============ Storage Utilities ============

/**
 * Get item from local storage with type safety
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Set item in local storage
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Remove item from local storage
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

// ============ Debounce/Throttle ============

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============ Array Utilities ============

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Calculate sum of array values
 */
export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
}

/**
 * Calculate average of array values
 */
export function avgBy<T>(array: T[], key: keyof T): number {
  if (array.length === 0) return 0;
  return sumBy(array, key) / array.length;
}

// ============ Export all utilities ============

export default {
  formatCurrency,
  formatPercent,
  formatOdds,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  getTierColor,
  getTierBgColor,
  getCLVColor,
  getProfitColor,
  getStatusColor,
  getFrameworkColor,
  americanToDecimal,
  decimalToAmerican,
  oddsToImpliedProb,
  calculateEdge,
  calculateKelly,
  calculatePayout,
  calculateROI,
  isValidEmail,
  isValidPassword,
  getSportDisplayName,
  getSportIcon,
  getBetTypeDisplayName,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  debounce,
  throttle,
  groupBy,
  sortBy,
  sumBy,
  avgBy,
};
