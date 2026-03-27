# Incident Response Runbook

## Quick Reference

| Severity | Response Time | Examples |
|----------|--------------|---------|
| **Critical** | Immediate | Site down, data breach, auth broken |
| **High** | < 1 hour | API errors for all users, converter broken |
| **Medium** | < 4 hours | Degraded performance, partial feature failure |
| **Low** | Next business day | UI glitch, non-blocking bug |

## Rollback a Deployment

### Via Vercel Dashboard (fastest)
1. Go to [Vercel Dashboard](https://vercel.com) > **photocalia** > **Deployments**
2. Find the last known good deployment
3. Click the **three-dot menu** (⋯) > **Promote to Production**
4. The rollback is instant with zero downtime

### Via Vercel CLI
```bash
# List recent deployments
vercel ls

# Promote a specific deployment to production
vercel promote <deployment-url>
```

## Monitoring Endpoints

| What | URL |
|------|-----|
| Production site | https://photocalia.com |
| API health | https://api.photocalia.com/health |
| Vercel deployment status | https://vercel.com/dashboard |
| Vercel Speed Insights | Vercel Dashboard > Analytics > Speed Insights |
| Vercel Web Analytics | Vercel Dashboard > Analytics > Web Analytics |

## Common Failure Scenarios

### 1. Site returns 500 / blank page
- **Check**: Vercel deployment logs in dashboard
- **Fix**: Rollback to previous deployment (see above)
- **Root cause**: Likely a build or SSR error in the latest deploy

### 2. API errors (converter not working)
- **Check**: `https://api.photocalia.com/health`
- **Check**: Cloud Run logs in Google Cloud Console
- **Fix**: If API is down, check Cloud Run service status and restart if needed
- **Note**: Frontend shows quota status via `/converter/quota-status`

### 3. Authentication broken (Google sign-in fails)
- **Check**: Firebase Console > Authentication
- **Check**: Browser console for Firebase auth errors
- **Common causes**: Firebase API key changed, auth domain mismatch, CSP blocking Firebase domains
- **Fix**: Verify `environment.prod.ts` Firebase config matches Firebase Console settings

### 4. Service Worker serving stale content
- **Symptoms**: Users see old version after deployment
- **Fix**: The service worker uses `prefetch` update strategy — new versions are fetched on next visit
- **Force fix**: Users can clear site data in browser settings, or you can bump the `appVersion` in environment config

### 5. Build failure on Vercel
- **Check**: Vercel Dashboard > Deployments > Failed build logs
- **Common causes**:
  - Missing environment variables (check `scripts/set-env.js` requirements)
  - Bundle size exceeding budget (1.8MB warning / 2.1MB error)
  - Dependency resolution issues (check `package-lock.json`)
- **Fix**: Fix the issue locally, push a new commit. Previous production deployment remains active.

## Communication Channels

| Channel | Purpose |
|---------|---------|
| GitHub Issues | Bug tracking and incident post-mortems |
| GitHub Actions | CI/CD status (Lighthouse, security audit, dead links) |
| Vercel Dashboard | Deployment status and logs |

## Post-Incident Checklist

- [ ] Incident resolved and verified
- [ ] Root cause identified
- [ ] Fix deployed (or rollback confirmed stable)
- [ ] GitHub issue created with post-mortem if severity was High or Critical
- [ ] Monitoring confirmed back to normal
- [ ] Any preventive measures identified and added to backlog
