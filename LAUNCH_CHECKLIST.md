# MUFIFA Launch Checklist

## 1. Environment Variables Configuration
Set the following inside your Vercel Project Settings:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key (Used for RPC / Admin bypassing)
- `NEXT_PUBLIC_SENTRY_DSN`: Your Sentry DSN URL
- `UPSTASH_REDIS_REST_URL`: Upstash Redis Endpoint
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis Token
- `LOG_LEVEL`: Set to `info`

## 2. Supabase Setup
- [] Push Migrations: `supabase db push`
- [] Apply Seed: Execute `supabase/seed.sql` in SQL Editor to populate Teams and Default Scoring Rules.
- [] Authentication: Enable Email/Password Auth in Supabase Dashboard. Disable "Confirm email" if you want frictionless onboarding.
- [] Storage: Ensure the `prediction-files` bucket exists and RLS prevents public download.

## 3. First Admin Account
- [] Register an account via the normal `/register` UI.
- [] Go to your Supabase SQL Editor and execute: 
  `UPDATE profiles SET role = 'admin' WHERE email = 'your-email@domain.com';`

## 4. Vercel / DNS Setup
- [] Link Github repository to Vercel.
- [] Map custom domain (e.g. `mufifa.com`).
- [] Turn on Web Analytics / Speed Insights (optional).

## 5. Deployment Smoke Tests
- [] Visit `/login` and verify form loads without Next.js errors.
- [] Login as Admin and visit `/admin`. Verify tables render without 500 exceptions.
- [] Create a Team via `/dashboard` and upload a dummy CSV to trigger the Sentry and Upstash endpoints.
- [] Verify `/api/health` returns HTTP 200 `{"db":"ok","auth":"ok","storage":"ok"}`.
