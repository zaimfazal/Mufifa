INSERT INTO scoring_rules (rule_key, rule_name, points) VALUES
  ('correct_winner', 'Correct Match Winner or Draw', 20),
  ('correct_draw', 'Correct Draw Prediction', 20),
  ('exact_scoreline', 'Exact Scoreline Match', 40),
  ('correct_goal_difference', 'Correct Goal Difference', 15),
  ('one_team_score_correct', 'One Team Exact Score Correct', 10),
  ('correct_scorer', 'Correct Goal Scorer (per player)', 10),
  ('correct_goal_count', 'Correct Goal Count for Scorer', 10),
  ('exact_scorer_list', 'Exact Scorer List Match', 25),
  ('exact_scorers', 'Exact Scorer Set (jersey numbers, limited mode)', 25),
  ('first_goal_scorer', 'Correct First Goal Scorer', 15),
  ('possession_accuracy', 'Possession Accuracy (±5%)', 10),
  ('shots_accuracy', 'Shots on Target Accuracy (±2)', 10),
  ('xg_accuracy', 'Expected Goals Accuracy (±0.5)', 10),
  ('yellow_cards_accuracy', 'Yellow Cards Accuracy (±1)', 5),
  ('red_cards_exact', 'Exact Red Cards Count', 10),
  ('penalty_winner', 'Correct Penalty Shootout Winner', 20),
  ('penalty_score', 'Exact Penalty Score', 30),
  ('confidence_bonus', 'High Confidence Bonus (>80%)', 10),
  ('confidence_penalty', 'High Confidence Penalty (>80%)', -10),
  ('champion_prediction', 'Correct Tournament Champion', 100)
ON CONFLICT (rule_key) DO UPDATE SET 
  points = EXCLUDED.points,
  rule_name = EXCLUDED.rule_name;
