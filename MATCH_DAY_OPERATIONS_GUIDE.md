# Match Day Operations Guide

## 1. Admin Provisioning
**Exact Table Storing Roles:** `public.profiles`
**Exact Value for Admin Role:** `'admin'` (ENUM `user_role`)
**Exact SQL to Promote Account:**
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## 2. Admin Verification
**URL for Admin Dashboard:** `https://your-domain.com/admin`
**How to Verify Access:** Navigate to `/admin`. The backend `requireAdmin()` middleware inside Server Actions will verify the `'admin'` enum on your `profiles` record. If successful, you will see the Admin Dashboard. If unauthorized, you will be thrown a "Not authorized" block.

## 3. Match Management
**How to Create a Match:** Matches are managed at `/admin/matches`. Administrators can use the `<MatchForm>` UI component to dynamically inject matches, or insert directly into the `public.matches` SQL table.

## 4. Entering Results & Recalculation Trigger
**How to Enter an Actual Result:** Navigate to `/admin/results`. The UI lists all active matches. Fill out the **Home Score** and **Away Score** in the `<ResultEntryForm>` and press Submit.
**How Scoring Recalculation is Triggered:** Entering a result executes the `adminUpdateMatchResult` server action. It updates `actual_results` and instantly triggers `recalculateForMatch(matchId)` in the background.
**How Leaderboard Recalculation is Triggered:** The edge calculator seamlessly cascades into `recalculateAll()`, sorting users by `total_score` -> `accuracy_percentage` -> `locked_at` timestamp. It updates the `leaderboard` table and runs `revalidatePath('/leaderboard')` to clear the Next.js cache.
**How to Manually Trigger Recalculation:** On the root `/admin` dashboard, click the red **"Recalculate All Scores"** button. This directly invokes the `adminRecalculateAll()` Next.js server action to run a global sweep.

---

## 5. Step-by-Step Manual Test Plan

Run this checklist to verify production readiness:

**Phase A: Admin Login**
1. Register a standard account via the `/register` endpoint.
2. Open your Supabase SQL Editor and execute the `UPDATE public.profiles SET role = 'admin'` SQL constraint.
3. Sign out and sign back in to issue a fresh JWT.
4. Navigate to `/admin` and assert the Dashboard loads.

**Phase B: Match Result Entry**
1. Navigate to `/admin/results`.
2. Locate a match (e.g., Match `M1`: France vs Brazil).
3. Input `Home Score: 2` and `Away Score: 1`.
4. Click **Submit Result**.
5. Assert the Match UI badge turns green (`Result Entered`).

**Phase C: Score Calculation Verification**
1. Navigate to `/admin/scoring` (or check Supabase `leaderboard` table directly).
2. Assert that teams who successfully predicted France winning inherited points based on the active `scoring_rules`.

**Phase D: Leaderboard Update**
1. Open a new Incognito browser window.
2. Navigate to the public `/leaderboard` page.
3. Assert that the cache has been busted and the ranking visually corresponds to the new point allocations.
