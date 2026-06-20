-- Seed script for FIFA World Cup 2026 
-- Note: Replace UUIDs with proper references if generating programmatically

-- 1. Insert Teams (Subset for 2026 World Cup)
INSERT INTO public.teams (team_name, logo_url) VALUES 
('Argentina', 'argentina.png'),
('France', 'france.png'),
('Brazil', 'brazil.png'),
('England', 'england.png'),
('Spain', 'spain.png'),
('Germany', 'germany.png'),
('Portugal', 'portugal.png'),
('Netherlands', 'netherlands.png'),
('USA', 'usa.png'),
('Mexico', 'mexico.png'),
('Canada', 'canada.png')
ON CONFLICT DO NOTHING;

-- 2. Insert Default Scoring Rules
INSERT INTO public.scoring_rules (rule_key, rule_name, points, is_enabled) VALUES
('correct_winner', 'Correct Winner', 20, true),
('correct_draw', 'Correct Draw', 20, true),
('exact_scoreline', 'Exact Scoreline', 40, true),
('correct_goal_difference', 'Correct Goal Difference', 15, true),
('one_team_score_correct', 'One Team Score Correct', 10, true),
('confidence_bonus', 'High Confidence Bonus (>80%)', 10, true),
('confidence_penalty', 'High Confidence Penalty (>80%)', -10, true),
('correct_scorer', 'Correct Goal Scorer (Anytime)', 5, true),
('correct_goal_count', 'Correct Goal Count for Scorer', 5, true),
('exact_scorer_list', 'Exact Scorer List', 10, true),
('first_goal_scorer', 'First Goal Scorer', 5, true),
('possession_accuracy', 'Possession Accuracy (+/- 5%)', 5, true),
('shots_accuracy', 'Shots Accuracy (+/- 2)', 5, true),
('xg_accuracy', 'xG Accuracy (+/- 0.5)', 5, true),
('yellow_cards_accuracy', 'Yellow Cards Exact', 5, true),
('red_cards_exact', 'Red Cards Exact', 5, true),
('penalty_winner', 'Penalty Shootout Winner', 10, true),
('penalty_score', 'Penalty Shootout Exact Score', 15, true),
('champion_prediction', 'Correct Tournament Champion', 50, true)
ON CONFLICT DO NOTHING;

-- 3. Insert Stage Multipliers (To be applied to matches)
-- Example: Groups = 1.0, R32 = 1.25, R16 = 1.5, QF = 2.0, SF = 3.0, Final = 5.0
-- Matches can be populated via admin UI or extended script here.
