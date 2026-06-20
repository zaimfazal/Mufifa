BEGIN;

-- 1. Wipe all transactional tournament data. 
-- This completely resets all leaderboards, scores, and prediction data, even for the admin account if they made test predictions.
TRUNCATE TABLE predictions CASCADE;
TRUNCATE TABLE champion_predictions CASCADE;
TRUNCATE TABLE submissions CASCADE;
TRUNCATE TABLE leaderboard CASCADE;

-- 2. Wipe caches and logs to ensure the system boots fresh.
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE analytics_cache CASCADE;

-- 3. Delete all participant users from the core Auth system.
-- Because of Supabase's strict `ON DELETE CASCADE` constraints, deleting the auth user will organically and cleanly delete their `profiles` row and `teams` row.
DELETE FROM auth.users 
WHERE id IN (
    SELECT id FROM public.profiles WHERE role = 'participant'
);

-- (Optional Safeguard) Delete any orphaned auth users who failed to generate a profile
DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Admin accounts, Matches, Actual Results, and Scoring Rules are preserved seamlessly.

COMMIT;
