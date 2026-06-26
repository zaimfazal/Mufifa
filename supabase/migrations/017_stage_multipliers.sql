-- 017_stage_multipliers.sql
-- Creates a stage_multipliers table to store per-stage point multipliers.
-- These drive the matches.multiplier column, kept in sync on every save.

CREATE TABLE IF NOT EXISTS stage_multipliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage        TEXT NOT NULL UNIQUE, -- matches tournament_stage enum values as text
  stage_label  TEXT NOT NULL,
  multiplier   NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default multipliers
INSERT INTO stage_multipliers (stage, stage_label, multiplier) VALUES
  ('round_of_16',   'Round of 16',  1.5),
  ('quarter_final', 'Quarter Final', 2.0),
  ('semi_final',    'Semi Final',    3.0),
  ('third_place',   'Third Place',   2.5),
  ('final',         'Final',         5.0)
ON CONFLICT (stage) DO UPDATE SET
  multiplier  = EXCLUDED.multiplier,
  stage_label = EXCLUDED.stage_label,
  updated_at  = NOW();

-- Sync existing matches rows to the seeded values
UPDATE matches m
SET    multiplier = sm.multiplier
FROM   stage_multipliers sm
WHERE  m.stage::text = sm.stage;

-- Allow read access so the public leaderboard can display stage info
GRANT SELECT ON stage_multipliers TO anon, authenticated;
