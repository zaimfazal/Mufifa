# Vercel Deployment Report

## 1. Environment Variable Verification
The application heavily utilizes Edge-compatible configurations. To successfully execute in Vercel, the following variables MUST be mapped in the Vercel project settings:
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY`
* `NEXT_PUBLIC_SENTRY_DSN`
* `UPSTASH_REDIS_REST_URL`
* `UPSTASH_REDIS_REST_TOKEN`

## 2. Next.js Build Configuration
* **Turbopack / App Router**: Vercel natively caches Server Components. We use `revalidatePath` in Server Actions to bust cache during team/submission states.
* **Middleware**: `src/middleware.ts` runs strictly on the Edge, intercepting unprotected routes without bottlenecking Serverless functions.

## 3. Distributed Integration
* **Supabase**: Realtime listeners (`supabase.channel()`) and Authentication tokens (`cookies`) execute cleanly in Server/Edge/Client layers.
* **Upstash**: Because Vercel does not guarantee cross-instance memory sharing, Upstash Redis acts as our centralized rate-limiting consensus node.
* **Sentry**: Serverless errors will propagate automatically via the Vercel-Sentry integration or the `global-error.tsx` boundary.

## Conclusion
The architecture cleanly maps onto Vercel's Edge/Serverless paradigms with zero "in-memory only" bottlenecks remaining.
