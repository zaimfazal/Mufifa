# Real Smoke Test Checklist

Execution of this checklist MUST be completed manually on the actual Production domain immediately following DNS propagation.

## Phase 1: Authentication & Identity
- [ ] **User Registration**: Register a new account (`/register`).
- [ ] **Email Verification**: (If Supabase Confirm Email is ON) Verify the magic link or 6-digit OTP works.
- [ ] **Login**: Sign out and sign back in to assert cookie persistence.
- [ ] **Admin Provisioning**: Set your user `role` to `admin` directly via Supabase SQL Editor and refresh token.

## Phase 2: Ingress & Validation
- [ ] **Team Creation**: Go to `/dashboard` and create a team name.
- [ ] **Invalid CSV Rejection**: Upload a CSV with a malformed `Goal Scorer` syntax (e.g. `Mbappe|2`). Ensure system intercepts and displays an error without 500ing.
- [ ] **CSV Upload (Valid)**: Upload a correct 104-row prediction CSV.
- [ ] **Submission Lock**: Assert that the team's dashboard UI transitions into a `Locked` state and prevents further uploads.

## Phase 3: Core Loop Execution
- [ ] **Admin Login**: Navigate to `/admin/results`. Assert the page does not redirect you to `/login`.
- [ ] **Result Entry**: Input the actual scoreline for Match `M1` (e.g. France 2 - 1 Brazil).
- [ ] **Score Recalculation**: View the Vercel Function logs to ensure the Edge Recalculation trigger successfully fired.
- [ ] **Leaderboard Update**: Assert your team received points in the database.
- [ ] **Analytics Update**: Check if Tournament Champion distribution counts updated in `analytics_cache`.
- [ ] **Public Leaderboard Access**: Open an Incognito window and visit `/leaderboard`. Assert your team name and accuracy percentage correctly render.

## Phase 4: UX & Polish
- [ ] **Mobile Responsiveness**: Emulate an iPhone 14 Pro in Chrome DevTools and assert the Navigation bar collapses into the Hamburger Menu and tables enable horizontal scrolling.
