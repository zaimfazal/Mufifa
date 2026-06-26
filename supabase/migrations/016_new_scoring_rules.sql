-- 016_new_scoring_rules.sql
-- Replaces the old scoring system with 9 clean match-level rules.
-- Old rules are DELETED (not just disabled) so they no longer appear in the admin UI.

-- Step 1: DELETE old/deprecated rules permanently
DELETE FROM scoring_rules
WHERE rule_key IN (
  'correct_draw',
  'one_team_score_correct',
  'correct_scorer',
  'exact_scorer_list',
  'exact_scorers',
  'correct_goal_count',
  'first_goal_scorer',
  'possession_accuracy',
  'shots_accuracy',
  'xg_accuracy',
  'yellow_cards_accuracy',
  'red_cards_exact',
  'penalty_winner',
  'penalty_score',
  'confidence_bonus',
  'confidence_penalty',
  'exact_scoreline'
);

-- Step 2: Rename/update the two surviving old rules
UPDATE scoring_rules
SET rule_key   = 'predicted_winner_correct',
    rule_name  = 'Predicted Winner Correct',
    points     = 20,
    is_enabled = true,
    updated_at = NOW()
WHERE rule_key = 'correct_winner';

UPDATE scoring_rules
SET rule_key   = 'goal_difference_correct',
    rule_name  = 'Goal Difference Correct',
    points     = 15,
    is_enabled = true,
    updated_at = NOW()
WHERE rule_key = 'correct_goal_difference';

UPDATE scoring_rules
SET rule_name  = 'Correct Tournament Champion',
    points     = 250,
    is_enabled = true,
    updated_at = NOW()
WHERE rule_key = 'champion_prediction';

-- Step 3: Insert the 7 brand-new rules
INSERT INTO scoring_rules (rule_key, rule_name, points, is_enabled) VALUES
  ('home_team_correct',  'Home Team Correct',                 5,   true),
  ('away_team_correct',  'Away Team Correct',                 5,   true),
  ('home_goals_correct', 'Home Goals Correct',               10,   true),
  ('away_goals_correct', 'Away Goals Correct',               10,   true),
  ('scorer_match_home',  'Scorer Match – Home (Fractional)', 30,   true),
  ('scorer_match_away',  'Scorer Match – Away (Fractional)', 30,   true),
  ('all_correct_bonus',  'All Correct Bonus',               250,   true)
ON CONFLICT (rule_key) DO UPDATE SET
  rule_name  = EXCLUDED.rule_name,
  points     = EXCLUDED.points,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = NOW();
