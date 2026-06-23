-- Migration: add the exact-scorers scoring rule used by limited mode.
-- Limited mode scores only exact scoreline + an exact per-team set of scorer
-- jersey numbers (no goal counts). This rule holds the points for the scorer set.

INSERT INTO scoring_rules (rule_key, rule_name, points)
VALUES ('exact_scorers', 'Exact Scorer Set (jersey numbers, limited mode)', 25)
ON CONFLICT (rule_key) DO UPDATE SET
  points = EXCLUDED.points,
  rule_name = EXCLUDED.rule_name;
