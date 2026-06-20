# Deployment Runbook

## 1. SAAS Provisioning Order
1. **Supabase**: Create new production project.
   - Go to Authentication -> Enable Email login (Disable explicit verification for frictionless onboarding).
   - Go to Storage -> Create bucket `prediction-files`.
   - Run `supabase db push`.
   - Execute `supabase/seed.sql` in SQL Editor.
2. **Upstash Redis**: Create database.
   - Select Global / Edge optimized tier.
3. **Sentry**: Create Next.js project.
   - Copy the DSN.
4. **Vercel**: Import Github Repository.
   - Set Framework Preset to `Next.js`.

## 2. Environment Variables (`.env.production`)
Inject into Vercel settings:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SENTRY_DSN=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
LOG_LEVEL=info
```

## 3. First Admin Provisioning
Once deployed:
1. Register a standard user account on `mufifa.com/register`.
2. Open Supabase SQL Editor and execute:
   `UPDATE profiles SET role = 'admin' WHERE email = 'your-email@mufifa.com';`
3. Log out and log back in to refresh JWT claims.
