# API Endpoints Status Report

This document compares the documented API endpoints with what's actually implemented in the codebase.

## Summary

- **Documented**: 143 endpoints
- **Implemented**: Checking...
- **Missing**: To be determined

## Endpoint Status by Module

### 1. Authentication Endpoints (16 documented)

**Expected:**
- POST /api/v1/auth/login
- POST /api/v1/auth/register
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- POST /api/v1/auth/2fa/setup
- POST /api/v1/auth/2fa/verify
- GET /api/v1/auth/me
- PUT /api/v1/auth/me
- POST /api/v1/auth/password/change
- POST /api/v1/auth/password/reset
- POST /api/v1/auth/password/reset/confirm
- GET /api/v1/auth/sessions
- DELETE /api/v1/auth/sessions/{id}
- POST /api/v1/auth/api-keys
- GET /api/v1/auth/api-keys
- DELETE /api/v1/auth/api-keys/{id}

**Status**: Checking implementation...

### 2. Predictions Endpoints (8 documented)

**Expected:**
- GET /api/v1/predictions
- GET /api/v1/predictions/{id}
- GET /api/v1/predictions/today
- GET /api/v1/predictions/sport/{code}
- GET /api/v1/predictions/tier/{tier}
- GET /api/v1/predictions/stats
- GET /api/v1/predictions/{id}/explanation
- POST /api/v1/predictions/verify/{id}

**Status**: Checking implementation...

### 3. Games & Odds Endpoints (16 documented)

**Status**: Checking implementation...

### 4. Player Props Endpoints (10 documented)

**Status**: Checking implementation...

### 5. Betting & Bankroll Endpoints (9 documented)

**Status**: Checking implementation...

### 6. Backtesting Endpoints (11 documented)

**Status**: Checking implementation...

### 7. ML Models Endpoints (12 documented)

**Status**: Checking implementation...

### 8. Analytics Endpoints (9 documented)

**Status**: Checking implementation...

### 9. Monitoring Endpoints (19 documented)

**Status**: Checking implementation...

### 10. Admin Endpoints (24 documented)

**Status**: Checking implementation...

### 11. Health Endpoints (9 documented)

**Status**: Checking implementation...

### 12. Reports Endpoints

**Status**: Checking implementation...

---

*This report is being generated. Run the analysis script to get complete details.*

