# Appendix D: Error Codes & Troubleshooting Guide

## API Error Codes

### Authentication Errors (1xxx)

| Code | HTTP Status | Message | Cause | Resolution |
|------|-------------|---------|-------|------------|
| 1001 | 401 | Invalid credentials | Wrong username/password | Verify credentials |
| 1002 | 401 | Token expired | JWT access token expired | Refresh token |
| 1003 | 401 | Invalid token | Malformed or tampered token | Re-authenticate |
| 1004 | 401 | Token revoked | Token manually invalidated | Re-authenticate |
| 1005 | 403 | Insufficient permissions | User lacks required role | Contact admin |
| 1006 | 401 | 2FA required | Two-factor not provided | Complete 2FA |
| 1007 | 401 | Invalid 2FA code | Wrong TOTP code | Retry with correct code |
| 1008 | 429 | Too many login attempts | Rate limit exceeded | Wait 15 minutes |
| 1009 | 401 | API key invalid | Invalid or expired API key | Generate new key |
| 1010 | 401 | API key revoked | API key manually revoked | Generate new key |

### Validation Errors (2xxx)

| Code | HTTP Status | Message | Cause | Resolution |
|------|-------------|---------|-------|------------|
| 2001 | 400 | Missing required field | Required field not provided | Include required fields |
| 2002 | 400 | Invalid field format | Field format incorrect | Check field specifications |
| 2003 | 400 | Value out of range | Value exceeds allowed range | Use valid range |
| 2004 | 400 | Invalid date format | Date not ISO 8601 | Use ISO 8601 format |
| 2005 | 400 | Invalid sport code | Sport code not recognized | Use valid sport code |
| 2006 | 400 | Invalid bet type | Bet type not supported | Use valid bet type |
| 2007 | 400 | Invalid odds format | Odds format unrecognized | Use American odds format |
| 2008 | 400 | Pagination limit exceeded | Page size too large | Reduce page size |
| 2009 | 400 | Invalid filter combination | Conflicting filter parameters | Adjust filters |
| 2010 | 400 | Invalid JSON | Request body not valid JSON | Fix JSON syntax |

### Resource Errors (3xxx)

| Code | HTTP Status | Message | Cause | Resolution |
|------|-------------|---------|-------|------------|
| 3001 | 404 | Game not found | Game ID doesn't exist | Verify game ID |
| 3002 | 404 | Prediction not found | Prediction ID doesn't exist | Verify prediction ID |
| 3003 | 404 | Team not found | Team ID doesn't exist | Verify team ID |
| 3004 | 404 | Player not found | Player ID doesn't exist | Verify player ID |
| 3005 | 404 | Model not found | Model ID doesn't exist | Verify model ID |
| 3006 | 404 | User not found | User ID doesn't exist | Verify user ID |
| 3007 | 409 | Resource already exists | Duplicate creation attempt | Use existing resource |
| 3008 | 410 | Resource deleted | Resource was deleted | Resource no longer available |
| 3009 | 404 | No odds available | No odds for this game | Check later |
| 3010 | 404 | Sport not supported | Sport not in system | Use supported sport |

### Data Errors (4xxx)

| Code | HTTP Status | Message | Cause | Resolution |
|------|-------------|---------|-------|------------|
| 4001 | 503 | Data source unavailable | External API down | Retry later |
| 4002 | 503 | Odds feed delayed | Odds data stale | Using cached data |
| 4003 | 500 | Data validation failed | Data quality issue | Contact support |
| 4004 | 503 | Feature calculation failed | Feature engineering error | Retry or contact support |
| 4005 | 500 | Data inconsistency | Cross-source mismatch | Contact support |
| 4006 | 503 | Historical data unavailable | Backfill incomplete | Limited functionality |
| 4007 | 500 | Closing line unavailable | CLV cannot be calculated | Wait for closing line |
| 4008 | 503 | Weather data unavailable | Weather API issue | Using default values |
| 4009 | 503 | Injury data unavailable | Injury feed issue | Predictions less accurate |
| 4010 | 500 | Score update failed | Score ingestion error | Manual intervention needed |

### ML Errors (5xxx)

| Code | HTTP Status | Message | Cause | Resolution |
|------|-------------|---------|-------|------------|
| 5001 | 503 | Model not loaded | Model loading failed | Retry or use fallback |
| 5002 | 500 | Prediction failed | Inference error | Contact support |
| 5003 | 503 | Model training in progress | Model being retrained | Use existing model |
| 5004 | 500 | Feature mismatch | Features don't match model | Contact support |
| 5005 | 503 | Insufficient data | Not enough data for prediction | Wait for more data |
| 5006 | 500 | Calibration failed | Probability calibration error | Using raw probabilities |
| 5007 | 503 | Model degraded | Performance below threshold | Monitoring active |
| 5008 | 500 | SHAP calculation failed | Explanation generation error | Prediction still valid |
| 5009 | 503 | AutoGluon unavailable | AutoGluon service down | Using H2O only |
| 5010 | 503 | H2O unavailable | H2O service down | Using AutoGluon only |

### System Errors (6xxx)

| Code | HTTP Status | Message | Cause | Resolution |
|------|-------------|---------|-------|------------|
| 6001 | 500 | Internal server error | Unexpected error | Contact support |
| 6002 | 503 | Database unavailable | Database connection failed | Retry later |
| 6003 | 503 | Cache unavailable | Redis connection failed | Slower responses |
| 6004 | 503 | Service overloaded | High load | Retry with backoff |
| 6005 | 503 | Maintenance mode | Scheduled maintenance | Check status page |
| 6006 | 504 | Request timeout | Request took too long | Reduce request scope |
| 6007 | 500 | Configuration error | System misconfigured | Contact support |
| 6008 | 503 | Dependency failed | Downstream service error | Retry later |
| 6009 | 507 | Storage full | Disk space exhausted | Alert triggered |
| 6010 | 503 | GPU unavailable | GPU service down | CPU fallback active |

### Betting Errors (7xxx)

| Code | HTTP Status | Message | Cause | Resolution |
|------|-------------|---------|-------|------------|
| 7001 | 400 | Insufficient bankroll | Bet exceeds available funds | Reduce bet size |
| 7002 | 400 | Below minimum bet | Bet below minimum threshold | Increase bet size |
| 7003 | 400 | Above maximum bet | Bet exceeds maximum | Reduce bet size |
| 7004 | 400 | No edge detected | Probability below threshold | Bet not recommended |
| 7005 | 409 | Bet already placed | Duplicate bet attempt | Use existing bet |
| 7006 | 400 | Game already started | Cannot bet on live game | Bet earlier |
| 7007 | 400 | Invalid odds | Odds have changed | Refresh odds |
| 7008 | 400 | Market closed | Betting market closed | Market unavailable |
| 7009 | 403 | Betting disabled | User betting disabled | Contact support |
| 7010 | 400 | Stake validation failed | Invalid stake amount | Use valid amount |

## Common Issues & Resolutions

### Issue: Predictions Not Updating

**Symptoms**:
- Same predictions shown repeatedly
- Timestamp not changing
- Missing new games

**Possible Causes**:
1. Data collection job failed
2. Cache not invalidating
3. Model serving issues
4. Database connection problems

**Resolution Steps**:
1. Check data collection logs for errors
2. Verify Redis cache TTL settings
3. Check model health endpoint
4. Test database connectivity
5. Restart prediction service if needed

### Issue: High API Latency

**Symptoms**:
- Response times >500ms
- Timeouts reported
- Degraded user experience

**Possible Causes**:
1. Database query performance
2. Missing database indexes
3. Large result sets
4. Cache misses
5. High system load

**Resolution Steps**:
1. Check slow query logs
2. Verify indexes are in place
3. Add pagination to large queries
4. Warm up caches
5. Scale horizontally if needed

### Issue: Model Accuracy Degradation

**Symptoms**:
- Accuracy dropping below thresholds
- CLV trending negative
- Alert notifications triggered

**Possible Causes**:
1. Data drift in features
2. Concept drift (sports dynamics changed)
3. Data quality issues
4. Feature calculation errors
5. Calibration drift

**Resolution Steps**:
1. Run feature drift analysis
2. Check data quality metrics
3. Verify feature calculations
4. Trigger model retraining
5. Review recent performance by segment

### Issue: External API Failures

**Symptoms**:
- Missing odds data
- Stale game information
- Error rates increasing

**Possible Causes**:
1. Provider API down
2. Rate limits exceeded
3. API key expired
4. Network connectivity issues
5. Provider schema changes

**Resolution Steps**:
1. Check provider status page
2. Verify rate limit usage
3. Rotate API keys if expired
4. Test network connectivity
5. Review API response schemas

### Issue: Database Connection Exhaustion

**Symptoms**:
- Connection timeout errors
- Intermittent failures
- Queue buildup

**Possible Causes**:
1. Connection pool too small
2. Connection leaks
3. Long-running transactions
4. Database overloaded
5. Network saturation

**Resolution Steps**:
1. Increase pool size
2. Check for unclosed connections
3. Identify long transactions
4. Scale database resources
5. Check network metrics

### Issue: Memory Pressure

**Symptoms**:
- OOM errors
- Service restarts
- Slow garbage collection

**Possible Causes**:
1. Memory leaks
2. Large model loading
3. Cache size too large
4. DataFrame memory bloat
5. Concurrent request overload

**Resolution Steps**:
1. Profile memory usage
2. Implement model lazy loading
3. Configure cache eviction
4. Optimize DataFrame operations
5. Add request queuing

## Diagnostic Commands

### Health Check

**Endpoint**: `GET /api/v1/health/detailed`

**Response includes**:
- Database status
- Redis status
- Model availability
- GPU availability
- Recent error counts
- System resource usage

### Data Quality Check

**Endpoint**: `GET /api/v1/admin/data-quality`

**Response includes**:
- Data freshness by source
- Missing data counts
- Anomaly counts
- Quality scores by entity

### Model Status Check

**Endpoint**: `GET /api/v1/admin/models/status`

**Response includes**:
- Active model versions
- Recent accuracy metrics
- Training status
- Feature drift indicators

## Escalation Paths

### Severity 1 (Critical)

**Criteria**: Service completely down or data integrity compromised

**Escalation**:
1. Immediate: PagerDuty page to on-call
2. 15 minutes: Notify engineering manager
3. 30 minutes: Notify VP Engineering
4. 1 hour: Executive notification

### Severity 2 (Major)

**Criteria**: Significant functionality impaired

**Escalation**:
1. Immediate: Slack #incidents channel
2. 30 minutes: Page on-call if unacknowledged
3. 2 hours: Engineering manager notification

### Severity 3 (Minor)

**Criteria**: Limited functionality impact

**Escalation**:
1. Immediate: Slack #incidents channel
2. Next business day: Engineering review

### Severity 4 (Informational)

**Criteria**: No immediate impact

**Escalation**:
1. Log for review
2. Weekly triage meeting
