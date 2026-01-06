# AI PRO SPORTS - Operations, Monitoring, and Maintenance

## Document Information
- **Version**: 2.0
- **Last Updated**: January 2026
- **Classification**: Enterprise Documentation

---

## 1. Deployment Workflows

### 1.1 Release Management Process

**Release Types**:
| Type | Frequency | Approval | Deployment Window |
|------|-----------|----------|-------------------|
| Hotfix | As needed | Tech Lead | Any time |
| Patch | Weekly | Tech Lead | Business hours |
| Minor | Bi-weekly | Engineering Manager | Maintenance window |
| Major | Monthly | VP Engineering | Scheduled downtime |

**Release Workflow**:
1. Feature development in feature branches
2. Pull request with code review
3. Automated tests pass
4. Merge to develop branch
5. Deploy to staging environment
6. QA verification in staging
7. Create release branch
8. Deploy to production (with approval)
9. Post-deployment verification
10. Tag release in repository

### 1.2 Deployment Procedures

**Pre-Deployment Checklist**:
- [ ] All automated tests passing
- [ ] Code review completed and approved
- [ ] Database migrations tested in staging
- [ ] Rollback plan documented
- [ ] Monitoring dashboards prepared
- [ ] On-call engineer notified
- [ ] Change management ticket created

**Deployment Steps**:
1. Announce deployment in operations channel
2. Enable deployment freeze for other changes
3. Run database migrations (if any)
4. Deploy new container images
5. Verify health checks passing
6. Run smoke tests
7. Monitor error rates for 15 minutes
8. Announce deployment complete or initiate rollback

**Post-Deployment Verification**:
- Health check endpoints responding
- Error rate within normal bounds (< 0.1%)
- Response latency within SLA
- Key business metrics stable
- No critical alerts triggered

### 1.3 Rollback Procedures

**Automatic Rollback Triggers**:
- Health check failures > 3 consecutive
- Error rate > 5% for 2 minutes
- p95 latency > 2000ms for 5 minutes

**Manual Rollback Process**:
1. Decision to rollback (on-call engineer or manager)
2. Announce rollback initiation
3. Revert to previous container images
4. Revert database migrations (if applicable)
5. Verify service recovery
6. Conduct post-incident review

**Rollback Time Targets**:
| Scenario | Target RTO |
|----------|------------|
| Container rollback | 5 minutes |
| Database migration rollback | 30 minutes |
| Full environment restore | 2 hours |

---

## 2. Backup and Disaster Recovery

### 2.1 Backup Strategy

**PostgreSQL Backups**:
| Backup Type | Schedule | Retention | Storage Location |
|-------------|----------|-----------|------------------|
| Full database dump | Daily 4:00 AM UTC | 30 days | Object storage (primary region) |
| Incremental (WAL) | Continuous | 7 days | Object storage (primary region) |
| Cross-region copy | Daily 6:00 AM UTC | 14 days | Object storage (DR region) |

**Redis Backups**:
| Backup Type | Schedule | Retention |
|-------------|----------|-----------|
| RDB snapshot | Every 15 minutes | 24 hours |
| AOF persistence | Continuous | Real-time |

**Model Artifacts**:
| Artifact Type | Trigger | Retention |
|---------------|---------|-----------|
| Production models | On promotion | Forever |
| Training checkpoints | On completion | 90 days |
| Feature store snapshots | Daily | 30 days |

**Configuration Backups**:
| Config Type | Schedule | Retention |
|-------------|----------|-----------|
| Application configs | On change | Version controlled |
| Infrastructure as code | On change | Version controlled |
| Secrets (encrypted) | On change | 90 days rotation |

### 2.2 Recovery Point Objectives (RPO)

| Data Category | RPO | Backup Method |
|---------------|-----|---------------|
| Transactional data | 5 minutes | WAL archiving |
| Prediction history | 1 hour | Hourly snapshots |
| User data | 15 minutes | WAL archiving |
| Model artifacts | 0 (immutable) | Object storage |
| Configuration | 0 (version controlled) | Git repository |

### 2.3 Recovery Time Objectives (RTO)

| Failure Scenario | RTO Target | Recovery Procedure |
|------------------|------------|-------------------|
| Single service failure | 2 minutes | Auto-restart/scaling |
| Database primary failure | 5 minutes | Automatic failover to replica |
| Full region failure | 4 hours | DR region activation |
| Data corruption | 2 hours | Point-in-time recovery |
| Ransomware/security incident | 24 hours | Clean restore from backups |

### 2.4 Disaster Recovery Procedures

**DR Region Activation**:
1. Declare disaster (requires management approval)
2. Verify backup integrity in DR region
3. Restore database from cross-region backup
4. Deploy application stack to DR infrastructure
5. Update DNS to point to DR region
6. Verify service functionality
7. Notify users of potential data loss (RPO)
8. Begin investigation of primary region

**DR Testing Schedule**: Quarterly

**DR Test Scenarios**:
- Database failover drill
- Full application restore drill
- Cross-region DNS failover drill
- Data recovery drill

---

## 3. Runbooks

### 3.1 Data Ingestion Failure

**Symptoms**:
- Missing odds data in database
- Stale data warnings
- Data freshness alerts

**Diagnostic Steps**:
1. Check external API status (TheOddsAPI, ESPN)
2. Verify API credentials validity
3. Check rate limit status
4. Review collector service logs
5. Verify network connectivity

**Resolution Steps**:
| Cause | Resolution |
|-------|------------|
| External API down | Wait for recovery, enable cached data mode |
| Rate limit exceeded | Wait for reset, adjust collection frequency |
| Credential expired | Rotate API credentials |
| Network issue | Check firewall rules, DNS resolution |
| Collector crash | Restart collector service, investigate logs |

**Escalation**: If unresolved after 30 minutes, escalate to on-call engineer

### 3.2 Model Serving Outage

**Symptoms**:
- Prediction endpoints returning errors
- Increased inference latency
- Model loading failures

**Diagnostic Steps**:
1. Check model serving container health
2. Verify model artifacts in storage
3. Check GPU availability and memory
4. Review model serving logs
5. Verify feature store connectivity

**Resolution Steps**:
| Cause | Resolution |
|-------|------------|
| Container crash | Restart model serving container |
| Model artifact corrupted | Rollback to previous model version |
| GPU memory exhaustion | Reduce batch size, restart container |
| Feature store unavailable | Enable cached features, restart feature store |
| High latency | Scale up model serving replicas |

**Escalation**: If unresolved after 15 minutes, escalate to ML engineering team

### 3.3 Database Performance Degradation

**Symptoms**:
- Slow API responses
- Query timeout errors
- High database CPU/memory usage

**Diagnostic Steps**:
1. Identify slow queries in pg_stat_statements
2. Check connection pool utilization
3. Review table sizes and bloat
4. Check replication lag
5. Review recent schema changes

**Resolution Steps**:
| Cause | Resolution |
|-------|------------|
| Missing index | Add appropriate index |
| Query inefficiency | Optimize query, add caching |
| Connection pool exhaustion | Increase pool size, optimize connections |
| Table bloat | Run VACUUM ANALYZE |
| Replication lag | Investigate replica, restart if needed |
| Lock contention | Identify blocking queries, terminate if safe |

**Escalation**: If unresolved after 20 minutes, escalate to database administrator

### 3.4 External Provider Downtime

**Symptoms**:
- Data collection failures
- API timeout errors
- Missing market data

**Immediate Actions**:
1. Verify provider status page
2. Switch to backup provider if available
3. Enable cached data mode
4. Notify users of potential stale data

**Communication Template**:
```
Subject: Data Provider Outage - [Provider Name]

Status: We are experiencing an outage with [Provider Name] affecting [data type].

Impact: [Describe user impact - stale odds, missing games, etc.]

Workaround: [Any available workarounds]

ETA: We are monitoring the provider's status and will update when service is restored.

Updates: Check our status page at [URL]
```

### 3.5 High Error Rate Alert

**Symptoms**:
- Error rate > 5%
- Increased 5xx responses
- User complaints

**Diagnostic Steps**:
1. Identify error types in logs
2. Check recent deployments
3. Verify external dependencies
4. Review system resources
5. Check database connectivity

**Resolution Steps**:
1. If recent deployment: Initiate rollback
2. If external dependency: Enable fallback/cache
3. If resource exhaustion: Scale up resources
4. If database: Follow database runbook
5. If unknown: Collect diagnostics and escalate

### 3.6 Security Incident Response

**Symptoms**:
- Unauthorized access attempts
- Data exfiltration alerts
- Unusual API patterns

**Immediate Actions**:
1. Isolate affected systems
2. Preserve logs and evidence
3. Notify security team
4. Assess scope of incident
5. Begin containment procedures

**Escalation**: Immediate escalation to security team and management

**Communication**: Follow security incident communication protocol (separate document)

---

## 4. Capacity Planning

### 4.1 Resource Monitoring

**Key Metrics to Track**:
| Resource | Warning Threshold | Critical Threshold |
|----------|------------------|-------------------|
| CPU utilization | 70% | 85% |
| Memory utilization | 75% | 90% |
| Disk utilization | 70% | 85% |
| Database connections | 70% of max | 85% of max |
| GPU memory | 80% | 95% |

### 4.2 Growth Projections

**Expected Growth**:
| Metric | Current | 6 Months | 12 Months |
|--------|---------|----------|-----------|
| Daily predictions | 10,000 | 25,000 | 50,000 |
| API requests/day | 1M | 2.5M | 5M |
| Database size | 50 GB | 100 GB | 200 GB |
| Concurrent users | 500 | 1,500 | 3,000 |

### 4.3 Scaling Triggers

**Horizontal Scaling**:
| Service | Scale Up Trigger | Scale Down Trigger |
|---------|-----------------|-------------------|
| API | CPU > 70% for 2 min | CPU < 30% for 5 min |
| Workers | Queue > 1000 messages | Queue < 100 messages |

**Vertical Scaling Considerations**:
- Database: Consider vertical scaling when queries consistently hit limits
- ML Training: GPU upgrade when training time exceeds acceptable window
- Redis: Memory increase when eviction rate increases

---

## 5. Regular Maintenance Tasks

### 5.1 Daily Tasks

| Task | Time (UTC) | Owner | Automation |
|------|------------|-------|------------|
| Log review | 09:00 | On-call | Automated alerts |
| Backup verification | 06:00 | Automated | Script |
| Data quality check | 08:00 | Data team | Automated |
| Model accuracy review | 10:00 | ML team | Dashboard |

### 5.2 Weekly Tasks

| Task | Day | Owner | Duration |
|------|-----|-------|----------|
| Model retraining | Monday | Automated | 4 hours |
| Performance review | Tuesday | Engineering | 1 hour |
| Security scan review | Wednesday | Security | 30 min |
| Capacity review | Thursday | SRE | 30 min |
| Change review meeting | Friday | All teams | 30 min |

### 5.3 Monthly Tasks

| Task | Week | Owner | Duration |
|------|------|-------|----------|
| Database maintenance (VACUUM FULL) | 1st | DBA | 2 hours |
| SSL certificate check | 1st | SRE | 15 min |
| Dependency updates | 2nd | Engineering | 2 hours |
| DR drill planning | 3rd | SRE | 1 hour |
| Capacity planning review | 4th | Management | 1 hour |

### 5.4 Quarterly Tasks

| Task | Owner | Duration |
|------|-------|----------|
| DR drill execution | SRE + All teams | 4 hours |
| Security audit | Security team | 1 week |
| Performance baseline update | Engineering | 2 hours |
| SLA review | Management | 2 hours |
| Infrastructure cost optimization | SRE | 4 hours |

### 5.5 Annual Tasks

| Task | Owner | Duration |
|------|-------|----------|
| Penetration testing | Security vendor | 2 weeks |
| Compliance audit | Compliance team | 1 month |
| Disaster recovery plan update | SRE | 1 week |
| Capacity planning for next year | Management | 2 weeks |

---

## 6. Monitoring and Alerting

### 6.1 Alert Severity Levels

| Level | Response Time | Examples |
|-------|---------------|----------|
| SEV1 - Critical | 15 minutes | Full outage, data loss, security breach |
| SEV2 - High | 1 hour | Partial outage, significant degradation |
| SEV3 - Medium | 4 hours | Minor degradation, single component failure |
| SEV4 - Low | 24 hours | Warnings, non-critical issues |

### 6.2 Alert Routing

| Severity | Notification Channel | Escalation |
|----------|---------------------|------------|
| SEV1 | PagerDuty + Phone + Slack | Immediate to management |
| SEV2 | PagerDuty + Slack | After 30 min to tech lead |
| SEV3 | Slack + Email | After 2 hours to on-call |
| SEV4 | Email digest | None |

### 6.3 On-Call Rotation

**Schedule**: Weekly rotation, Monday 9 AM UTC

**Responsibilities**:
- Monitor alert channels
- Respond to alerts within SLA
- Perform initial triage
- Escalate as needed
- Document incidents

**Compensation**: Per company policy

### 6.4 Alert Definitions

**Infrastructure Alerts**:
| Alert | Condition | Severity |
|-------|-----------|----------|
| High CPU | CPU > 85% for 5 min | SEV3 |
| High Memory | Memory > 90% for 5 min | SEV2 |
| Disk Full | Disk > 85% | SEV2 |
| Service Down | Health check fail 3x | SEV1 |

**Application Alerts**:
| Alert | Condition | Severity |
|-------|-----------|----------|
| High Error Rate | Error rate > 5% for 2 min | SEV1 |
| Slow Response | p95 > 2000ms for 5 min | SEV2 |
| Database Connection Pool | Utilization > 80% | SEV3 |
| Queue Backlog | Depth > 10,000 | SEV3 |

**Business Alerts**:
| Alert | Condition | Severity |
|-------|-----------|----------|
| Prediction Accuracy Drop | Accuracy < 52% for 7 days | SEV3 |
| Data Freshness | Odds > 5 min stale | SEV2 |
| Missing Predictions | Games without predictions | SEV2 |

---

## 7. Incident Management

### 7.1 Incident Response Process

**Phase 1: Detection (0-5 minutes)**
- Alert triggered or user report received
- On-call engineer acknowledges
- Initial impact assessment

**Phase 2: Triage (5-15 minutes)**
- Identify affected systems
- Determine severity level
- Begin diagnostic investigation
- Notify stakeholders if SEV1/SEV2

**Phase 3: Mitigation (15-60 minutes)**
- Implement temporary fix or workaround
- Restore service to users
- Continue root cause investigation

**Phase 4: Resolution (1-24 hours)**
- Implement permanent fix
- Verify fix effectiveness
- Close incident

**Phase 5: Post-Incident (24-72 hours)**
- Conduct post-incident review
- Document root cause and timeline
- Identify improvement actions
- Update runbooks if needed

### 7.2 Incident Communication

**Internal Communication**:
- Real-time updates in #incidents Slack channel
- Hourly status updates for SEV1/SEV2
- Incident commander designated for SEV1

**External Communication**:
- Status page updates within 15 minutes of SEV1
- User notifications for significant impact
- Post-incident summary for affected users

### 7.3 Post-Incident Review Template

**Sections**:
1. Incident Summary (what happened, impact, duration)
2. Timeline (detailed chronology)
3. Root Cause Analysis (5 Whys or similar)
4. What Went Well
5. What Could Be Improved
6. Action Items (with owners and due dates)
7. Lessons Learned

**Review Meeting**: Within 72 hours for SEV1/SEV2

---

## 8. Change Management

### 8.1 Change Types

| Type | Approval Required | Lead Time | Examples |
|------|------------------|-----------|----------|
| Standard | Pre-approved | None | Routine deployments, config changes |
| Normal | CAB approval | 3 days | New features, infrastructure changes |
| Emergency | Manager approval | None | Critical fixes, security patches |

### 8.2 Change Advisory Board (CAB)

**Meeting**: Weekly, Thursdays 2 PM UTC

**Attendees**: Engineering leads, SRE, Security, Product

**Agenda**:
1. Review of past week's changes
2. Review of upcoming changes
3. Risk assessment for significant changes
4. Approval/rejection of change requests

### 8.3 Change Request Template

**Required Information**:
- Change description
- Business justification
- Technical implementation plan
- Rollback plan
- Testing evidence
- Impact assessment
- Required downtime (if any)
- Responsible engineer
- Requested implementation date

---

*End of Operations Document*
