-- 021_disable_champion_prediction.sql
-- Disable the champion_prediction scoring rule.
-- The current limited-mode CSV template has no tournament_champion column,
-- so no user can ever submit a champion prediction. The rule is disabled
-- (not deleted) so it can be re-enabled in the future if the feature is added back.

UPDATE scoring_rules
SET is_enabled = false,
    updated_at = NOW()
WHERE rule_key = 'champion_prediction';
