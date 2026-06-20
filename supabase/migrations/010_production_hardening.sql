-- 009_production_fixes.sql
-- Create an RPC to handle the submission workflow transactionally

CREATE OR REPLACE FUNCTION submit_predictions(
  p_team_id UUID,
  p_file_path TEXT,
  p_file_name TEXT,
  p_champion TEXT,
  p_predictions JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  v_locked BOOLEAN;
BEGIN
  -- 1. Check if team is already locked
  SELECT submission_locked INTO v_locked FROM teams WHERE id = p_team_id FOR UPDATE;
  IF v_locked THEN
    RAISE EXCEPTION 'Team submission is already locked.';
  END IF;

  -- 2. Insert champion prediction
  IF p_champion IS NOT NULL AND p_champion != '' THEN
    INSERT INTO champion_predictions (team_id, champion) 
    VALUES (p_team_id, p_champion)
    ON CONFLICT (team_id) DO UPDATE SET champion = EXCLUDED.champion;
  END IF;

  -- 3. Delete existing predictions if any (just in case)
  DELETE FROM predictions WHERE team_id = p_team_id;

  -- 4. Insert predictions
  INSERT INTO predictions (
    team_id, 
    match_id, 
    winner, 
    home_score, 
    away_score, 
    extra_time_home, 
    extra_time_away, 
    penalty_home, 
    penalty_away, 
    goal_scorers, 
    first_goal_scorer, 
    possession_home, 
    possession_away, 
    shots_home, 
    shots_away, 
    xg_home, 
    xg_away, 
    yellow_home, 
    yellow_away, 
    red_home, 
    red_away, 
    confidence
  )
  SELECT 
    p_team_id, 
    (p->>'match_id')::UUID,
    p->>'winner',
    (p->>'home_score')::INTEGER,
    (p->>'away_score')::INTEGER,
    (p->>'extra_time_home')::INTEGER,
    (p->>'extra_time_away')::INTEGER,
    (p->>'penalty_home')::INTEGER,
    (p->>'penalty_away')::INTEGER,
    CASE WHEN (p->>'goal_scorers') IS NULL THEN NULL ELSE (p->'goal_scorers')::JSONB END,
    p->>'first_goal_scorer',
    (p->>'possession_home')::NUMERIC,
    (p->>'possession_away')::NUMERIC,
    (p->>'shots_home')::INTEGER,
    (p->>'shots_away')::INTEGER,
    (p->>'xg_home')::NUMERIC,
    (p->>'xg_away')::NUMERIC,
    (p->>'yellow_home')::INTEGER,
    (p->>'yellow_away')::INTEGER,
    (p->>'red_home')::INTEGER,
    (p->>'red_away')::INTEGER,
    (p->>'confidence')::INTEGER
  FROM jsonb_array_elements(p_predictions) AS p;

  -- 5. Record submission
  INSERT INTO submissions (team_id, file_path, file_name, is_valid, locked_at)
  VALUES (p_team_id, p_file_path, p_file_name, TRUE, NOW());

  -- 6. Lock team
  UPDATE teams SET submission_locked = TRUE WHERE id = p_team_id;

  -- 7. Setup initial leaderboard entry
  INSERT INTO leaderboard (team_id) VALUES (p_team_id)
  ON CONFLICT (team_id) DO NOTHING;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
