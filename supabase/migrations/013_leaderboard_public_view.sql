-- 013_leaderboard_public_view.sql
-- Fix: the leaderboard collapsed per-viewer because getLeaderboard joined
-- leaderboard -> teams with an inner join, and the teams table RLS only lets a
-- user read their OWN team (admins read all). So logged-out users saw nothing,
-- regular users saw only their own row, and admins saw everyone.
--
-- This view exposes ONLY the public leaderboard fields plus team_name. It runs
-- with the view owner's privileges (security_invoker is OFF by default), so it
-- bypasses the caller's teams RLS WITHOUT exposing the raw teams table
-- (owner_id, submission_locked stay private). We query this view instead of
-- joining teams directly.

CREATE OR REPLACE VIEW public.leaderboard_public AS
SELECT
  l.id,
  l.team_id,
  l.rank,
  l.total_score,
  l.accuracy_percentage,
  l.winner_score,
  l.scoreline_score,
  l.scorer_score,
  l.stats_score,
  l.champion_score,
  l.confidence_score,
  l.updated_at,
  t.team_name
FROM public.leaderboard l
JOIN public.teams t ON t.id = l.team_id;

-- Make the view readable by everyone (anon + authenticated).
GRANT SELECT ON public.leaderboard_public TO anon, authenticated;
