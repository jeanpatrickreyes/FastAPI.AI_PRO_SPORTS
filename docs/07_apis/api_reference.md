# API Reference

## AI PRO SPORTS - Complete API Documentation

**Version 3.0 | January 2026**

---

## Overview

The AI PRO SPORTS API provides RESTful endpoints for accessing predictions, games, odds, betting features, and system administration. All endpoints (except health checks) require authentication.

### Base URL
```
https://api.aiprosports.com/api/v1
```

### Authentication
- All requests require a valid JWT token in the Authorization header
- Token format: `Authorization: Bearer <token>`
- Tokens expire after 24 hours; use refresh endpoint to renew

### Rate Limiting
- Default: 100 requests per minute
- Pro users: 500 requests per minute
- Enterprise: Custom limits

---

## Authentication Endpoints

### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2026-01-02T12:00:00Z"
}
```

### POST /auth/login
Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJ..."
}
```

### POST /auth/logout
Invalidate current session.

### POST /auth/2fa/setup
Initialize two-factor authentication.

**Response (200):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code": "data:image/png;base64,..."
}
```

### POST /auth/2fa/verify
Verify 2FA code.

**Request Body:**
```json
{
  "code": "123456"
}
```

---

## Games Endpoints

### GET /games
List games with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sport | string | Sport code (NFL, NBA, etc.) |
| date | string | Game date (YYYY-MM-DD) |
| status | string | Game status (scheduled, in_progress, final) |
| page | int | Page number (default: 1) |
| limit | int | Results per page (default: 20, max: 100) |

**Response (200):**
```json
{
  "games": [
    {
      "id": "uuid",
      "sport": "NFL",
      "home_team": {"id": "uuid", "name": "Kansas City Chiefs", "abbreviation": "KC"},
      "away_team": {"id": "uuid", "name": "Buffalo Bills", "abbreviation": "BUF"},
      "game_date": "2026-01-05T20:00:00Z",
      "venue": "Arrowhead Stadium",
      "status": "scheduled",
      "home_score": null,
      "away_score": null
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### GET /games/{id}
Get single game details.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| include_odds | bool | Include current odds |
| include_stats | bool | Include team statistics |

### GET /games/today
Get today's games.

### GET /games/upcoming
Get future games.

---

## Odds Endpoints

### GET /odds/{game_id}
Get current odds for a game.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| market | string | Market type (spread, moneyline, total) |
| sportsbooks | string | Comma-separated sportsbook list |

**Response (200):**
```json
{
  "game_id": "uuid",
  "odds": [
    {
      "sportsbook": "DraftKings",
      "market": "spread",
      "home_line": -3.5,
      "home_price": -110,
      "away_line": 3.5,
      "away_price": -110,
      "recorded_at": "2026-01-02T12:00:00Z"
    }
  ]
}
```

### GET /odds/{game_id}/best
Get best available odds across all sportsbooks.

### GET /odds/{game_id}/history
Get historical odds for a game.

### GET /odds/{game_id}/movements
Get line movements for a game.

---

## Predictions Endpoints

### GET /predictions
List predictions with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sport | string | Sport code |
| tier | string | Signal tier (A, B, C, D) |
| date | string | Prediction date |
| min_edge | float | Minimum edge threshold |
| page | int | Page number |
| limit | int | Results per page |

**Response (200):**
```json
{
  "predictions": [
    {
      "id": "uuid",
      "game_id": "uuid",
      "game": {"home_team": "KC", "away_team": "BUF", "game_date": "2026-01-05"},
      "bet_type": "spread",
      "predicted_side": "HOME",
      "probability": 0.67,
      "edge": 0.05,
      "signal_tier": "A",
      "kelly_fraction": 0.08,
      "recommended_bet": 80.00,
      "line_at_prediction": -3.5,
      "odds_at_prediction": -110,
      "prediction_hash": "sha256...",
      "created_at": "2026-01-02T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

### GET /predictions/{id}
Get single prediction with full details.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| include_shap | bool | Include SHAP explanation |

**Response (200):**
```json
{
  "id": "uuid",
  "game": {...},
  "bet_type": "spread",
  "predicted_side": "HOME",
  "probability": 0.67,
  "edge": 0.05,
  "signal_tier": "A",
  "kelly_fraction": 0.08,
  "recommended_bet": 80.00,
  "model_version": "NFL_spread_v3.2",
  "prediction_hash": "sha256...",
  "shap_explanation": [
    {"feature": "home_elo", "value": 1580, "shap_value": 0.15, "impact": "positive"},
    {"feature": "away_b2b", "value": true, "shap_value": 0.08, "impact": "positive"},
    {"feature": "h2h_win_pct", "value": 0.6, "shap_value": 0.06, "impact": "positive"}
  ]
}
```

### GET /predictions/today
Get today's predictions.

### GET /predictions/performance
Get historical prediction performance.

### GET /predictions/verify/{hash}
Verify prediction integrity using hash.

---

## Betting Endpoints

### GET /betting/bankroll
Get user's bankroll information.

**Response (200):**
```json
{
  "id": "uuid",
  "initial_amount": 10000.00,
  "current_amount": 10850.00,
  "peak_amount": 11200.00,
  "low_amount": 9500.00,
  "roi": 8.5,
  "win_rate": 0.58,
  "total_bets": 150,
  "pending_bets": 3
}
```

### POST /betting/bet
Record a new bet.

**Request Body:**
```json
{
  "prediction_id": "uuid",
  "stake": 100.00,
  "odds_at_bet": -110
}
```

### GET /betting/bets
Get bet history.

### POST /betting/sizing
Calculate recommended bet size.

**Request Body:**
```json
{
  "probability": 0.67,
  "odds": -110,
  "bankroll": 10000.00
}
```

**Response (200):**
```json
{
  "full_kelly": 0.12,
  "fractional_kelly": 0.03,
  "recommended_bet": 300.00,
  "edge": 0.05,
  "expected_value": 15.00
}
```

### GET /betting/performance
Get betting performance metrics.

### GET /betting/clv
Get CLV analysis.

---

## Player Props Endpoints

### GET /props/game/{game_id}
Get player prop predictions for a game.

### GET /props/player/{player_id}
Get player prop predictions for a specific player.

### GET /props/today
Get today's player prop picks.

---

## Admin Endpoints (Admin Role Required)

### GET /admin/models
List all ML models.

### GET /admin/models/{id}
Get model details with performance metrics.

### POST /admin/models/train
Trigger model training.

**Request Body:**
```json
{
  "sport": "NFL",
  "bet_type": "spread"
}
```

### POST /admin/models/{id}/promote
Promote model to production.

### GET /admin/settings
Get system settings.

### PUT /admin/settings
Update system settings.

### GET /admin/users
List users (pagination supported).

### GET /admin/data-quality
Get data quality dashboard metrics.

### GET /admin/alerts
Get system alerts.

---

## Health Endpoints (No Auth Required)

### GET /health
Basic health check.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-02T12:00:00Z"
}
```

### GET /health/detailed
Detailed component health check.

**Response (200):**
```json
{
  "status": "healthy",
  "components": {
    "database": {"status": "healthy", "latency_ms": 5},
    "redis": {"status": "healthy", "latency_ms": 1},
    "models": {"status": "healthy", "loaded": 10},
    "api": {"status": "healthy", "requests_per_minute": 50}
  }
}
```

### GET /health/ready
Kubernetes readiness probe.

### GET /health/live
Kubernetes liveness probe.

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {"field": "sport", "message": "Invalid sport code"}
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request parameters |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

**AI PRO SPORTS - API Reference**

*Version 3.0 | January 2026*
