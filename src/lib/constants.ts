import { TournamentStage } from '@/types/database'

export const ALL_TOURNAMENT_STAGES: { value: TournamentStage; label: string }[] = [
  { value: 'group_stage', label: 'Group Stage' },
  { value: 'round_of_32', label: 'Round of 32' },
  { value: 'round_of_16', label: 'Round of 16' },
  { value: 'quarter_final', label: 'Quarter Final' },
  { value: 'semi_final', label: 'Semi Final' },
  { value: 'third_place', label: 'Third Place' },
  { value: 'final', label: 'Final' },
]

export const TOURNAMENT_STAGES: { value: TournamentStage; label: string; defaultMultiplier: number }[] = [
  { value: 'round_of_16', label: 'Round of 16', defaultMultiplier: 1.0 },
  { value: 'quarter_final', label: 'Quarter Final', defaultMultiplier: 2.0 },
  { value: 'semi_final', label: 'Semi Final', defaultMultiplier: 3.0 },
  { value: 'third_place', label: 'Third Place Play-off', defaultMultiplier: 2.5 },
  { value: 'final', label: 'Final', defaultMultiplier: 5.0 },
]

export const CSV_COLUMNS = [
  'match_id',
  'home_team',
  'away_team',
  'predicted_winner',
  'predicted_home_score',
  'predicted_away_score',
  'predicted_extra_time_home',
  'predicted_extra_time_away',
  'predicted_penalty_home',
  'predicted_penalty_away',
  'predicted_goal_scorers',
  'predicted_first_goal_scorer',
  'predicted_possession_home',
  'predicted_possession_away',
  'predicted_shots_home',
  'predicted_shots_away',
  'predicted_xg_home',
  'predicted_xg_away',
  'predicted_yellow_home',
  'predicted_yellow_away',
  'predicted_red_home',
  'predicted_red_away',
  'confidence',
  'tournament_champion'
]

// Limited-mode template: each match needs only the exact score and the set of
// scorer jersey numbers per team (semicolon-separated, e.g. "10;7").
export const CSV_LIMITED_COLUMNS = [
  'match_id',
  'stage',
  'home_team',
  'away_team',
  'predicted_home_score',
  'predicted_away_score',
  'predicted_scorers_home',
  'predicted_scorers_away',
  'predicted_winner',
]

export const LEGACY_CSV_COLUMNS = [
  'match_id',
  'winner',
  'home_score',
  'away_score',
  'extra_time_home',
  'extra_time_away',
  'penalty_home',
  'penalty_away',
  'goal_scorers',
  'goal_counts',
  'first_goal_scorer',
  'possession_home',
  'possession_away',
  'shots_on_target_home',
  'shots_on_target_away',
  'xg_home',
  'xg_away',
  'yellow_cards_home',
  'yellow_cards_away',
  'red_cards_home',
  'red_cards_away',
  'confidence',
]

export const MATCH_ID_PATTERN = /^(GS|R32|R16|QF|SF|TP|F)_[0-9]{3}$/

export const SCORING_TOLERANCES = {
  possession: 5,
  shots: 2,
  xg: 0.5,
  yellowCards: 1,
}

export const CONFIDENCE_MIN = 0
export const CONFIDENCE_MAX = 100
