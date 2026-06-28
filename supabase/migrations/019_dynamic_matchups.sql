-- Migration: Dynamic Matchups Support
-- Description: Adds columns to the predictions table to store the exact team names
-- that the user predicted, rather than discarding them. This allows the scoring
-- engine to dynamically match predictions against actual results regardless of
-- the specific match slot or home/away orientation, as long as it occurs in the
-- same tournament stage.

ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS predicted_home_team TEXT,
ADD COLUMN IF NOT EXISTS predicted_away_team TEXT;
