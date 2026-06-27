export interface CsvRow {
  __requiresChampion?: boolean;
  match_id: string;
  home_team: string;
  away_team: string;
  predicted_winner: string;
  predicted_home_score: string;
  predicted_away_score: string;
  predicted_extra_time_home: string;
  predicted_extra_time_away: string;
  predicted_penalty_home: string;
  predicted_penalty_away: string;
  predicted_goal_scorers: string;
  predicted_first_goal_scorer: string;
  predicted_possession_home: string;
  predicted_possession_away: string;
  predicted_shots_home: string;
  predicted_shots_away: string;
  predicted_xg_home: string;
  predicted_xg_away: string;
  predicted_yellow_home: string;
  predicted_yellow_away: string;
  predicted_red_home: string;
  predicted_red_away: string;
  confidence: string;
  tournament_champion: string;
}

export interface GoalScorer {
  name: string;
  goals: number;
}

// Limited-mode CSV row: exact score + scorer jersey numbers per team.
export interface LimitedCsvRow {
  match_id: string;
  home_team: string;
  away_team: string;
  predicted_winner: string;
  predicted_home_score: string;
  predicted_away_score: string;
  predicted_scorers_home: string;
  predicted_scorers_away: string;
}

// Limited-mode scorers, stored in the predictions.goal_scorers JSONB column.
export interface JerseyScorers {
  home: number[];
  away: number[];
}

export interface ParsedPrediction {
  match_id: string;
  winner: string | null;
  home_score: number | null;
  away_score: number | null;
  extra_time_home: number | null;
  extra_time_away: number | null;
  penalty_home: number | null;
  penalty_away: number | null;
  goal_scorers: GoalScorer[] | null;
  first_goal_scorer: string | null;
  possession_home: number | null;
  possession_away: number | null;
  shots_home: number | null;
  shots_away: number | null;
  xg_home: number | null;
  xg_away: number | null;
  yellow_home: number | null;
  yellow_away: number | null;
  red_home: number | null;
  red_away: number | null;
  confidence: number | null;
  // Limited mode only: scorer jersey-number sets per team. When present, this
  // is persisted into goal_scorers instead of the name-based GoalScorer[].
  goal_scorers_jersey?: JerseyScorers | null;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  predictions: ParsedPrediction[];
  champion: string;
}
