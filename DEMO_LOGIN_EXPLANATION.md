# Demo Login vs Real Login - Why 401 Errors?

## Why You're Seeing 401 Errors

### The Issue
You're getting **401 Unauthorized** errors because:

1. **Demo Token Not Recognized**: The backend doesn't recognize `demo-token` as valid
2. **Real Accounts Need Database**: Even with real accounts, the database connection is failing

## What I Just Fixed

✅ **Added Demo Token Support** to the backend:
- Backend now recognizes `demo-token` as a special authentication token
- Returns a mock demo user object
- Endpoints return empty/mock data for demo users (no database needed)

## How It Works Now

### Demo Login (No Database Required)
1. Click "Continue with Demo Account" button
2. Frontend sets `demo-token` in localStorage
3. Backend recognizes `demo-token` and returns mock demo user
4. Endpoints return empty/mock data:
   - Predictions: Empty array `[]`
   - Bankroll: Mock bankroll with $10,000
   - Daily Report: Empty stats (0.0 for all values)

**Status**: ✅ Should work now (after rebuild)

### Real Login (Requires Database)
1. User enters email/password
2. Frontend calls `/api/v1/auth/login`
3. Backend validates credentials against database
4. Backend returns JWT token
5. Frontend uses JWT token for all API calls
6. Endpoints query database and return real data

**Status**: ⚠️ Will fail until database connection is fixed

## Current Status

### ✅ Working (After Rebuild):
- Demo login with `demo-token`
- Endpoints return empty/mock data for demo users
- No database required for demo mode

### ⚠️ Not Working:
- Real login (database connection failing)
- Endpoints that need real data (will fail with database errors)

## Test It

### Test Demo Login:
```bash
# After rebuild, test with demo token
curl -H "Authorization: Bearer demo-token" http://localhost:8000/api/v1/predictions/today
# Should return: [] (empty array, not 401)

curl -H "Authorization: Bearer demo-token" http://localhost:8000/api/v1/betting/bankroll
# Should return: [{"id": 1, "name": "Demo Bankroll", "current_amount": 10000.0, ...}]
```

### Test Real Login (Will Fail Until DB Fixed):
```bash
# This will fail because database connection is broken
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

## Summary

**401 Errors Explained:**
- ❌ **Before fix**: Backend didn't recognize `demo-token` → 401
- ✅ **After fix**: Backend recognizes `demo-token` → Returns mock data
- ⚠️ **Real accounts**: Will still get 401 or database errors until DB is fixed

**Answer to Your Question:**
- **Demo account**: Should work now (after rebuild) - no database needed
- **Real account**: Will NOT work until database connection is fixed

The demo login is designed to work **without** a database, which is perfect for development and testing!

