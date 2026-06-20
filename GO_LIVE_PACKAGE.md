# Mufifa Go Live Package

## 1. Required Environment Variables
The Vercel environment must contain:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_SENTRY_DSN
LOG_LEVEL=info
```

## 2. Deployment Order
1. **Infrastructure**: Provision SAAS platforms (Supabase, Upstash, Sentry).
2. **Database Schema**: Execute `supabase db push` / Migrations.
3. **Database Seed**: Execute `supabase/seed.sql` in production SQL Editor.
4. **Vercel Hook**: Link repository to Vercel and hit **Deploy**.
5. **DNS Cutover**: Add Custom Domain inside Vercel networking.

## 3. Rollback Strategy
* **Next.js Revert**: If a UI/UX bug destroys frontend accessibility, use **Vercel Instant Rollback** via the Vercel Dashboard to revert to the previous working deployment hash. Zero downtime.
* **Database Revert**: Supabase performs daily PITR (Point in Time Recovery) backups on Pro plans. For schema corruptions, roll back the entire DB cluster via the Supabase Dashboard -> Database -> Backups.

## 4. Backup Strategy
* **Supabase**: PITR enabled (automatic 24-hour continuous rolling backups, or 7-day snapshots).
* **Storage Bucket**: The `prediction-files` bucket is fully hosted on AWS S3 within Supabase's infrastructure and inherits automatic redundancy.

## 5. Incident Response Steps
1. **Triage**: Check Sentry Dashboard for exact stack trace and affected user IDs.
2. **Mitigation**: If an exploit is live, pause Vercel deployments and enable "Maintenance Mode" via Vercel Edge Middleware.
3. **Investigation**: Query Vercel Runtime Logs / Pino Logs to track the anomaly.
4. **Patch**: Execute a hotfix branch and PR into `main`.

## 6. Post-Launch Monitoring
1. Monitor **Upstash Dashboard** to ensure Rate Limit hits stay below maximum threshold.
2. Monitor **Sentry Issues Tab** for unhandled frontend exceptions.
3. Monitor **Supabase Database Size** to ensure user JSON submissions aren't triggering excessive memory bloat.
