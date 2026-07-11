import { createAdminClient } from '../supabase/admin'
import { ScoringRule } from '@/types/scoring'

export const DEFAULT_SCORING_RULES: Record<string, ScoringRule> = {
  home_team_correct: { rule_key: 'home_team_correct', rule_name: 'Home Team Correct', points: 5, is_enabled: true },
  away_team_correct: { rule_key: 'away_team_correct', rule_name: 'Away Team Correct', points: 5, is_enabled: true },
  predicted_winner_correct: { rule_key: 'predicted_winner_correct', rule_name: 'Predicted Winner Correct', points: 20, is_enabled: true },
  home_goals_correct: { rule_key: 'home_goals_correct', rule_name: 'Home Goals Correct', points: 10, is_enabled: true },
  away_goals_correct: { rule_key: 'away_goals_correct', rule_name: 'Away Goals Correct', points: 10, is_enabled: true },
  goal_difference_correct: { rule_key: 'goal_difference_correct', rule_name: 'Goal Difference Correct', points: 15, is_enabled: true },
  scorer_match_home: { rule_key: 'scorer_match_home', rule_name: 'Scorer Match - Home', points: 30, is_enabled: true },
  scorer_match_away: { rule_key: 'scorer_match_away', rule_name: 'Scorer Match - Away', points: 30, is_enabled: true },
  all_correct_bonus: { rule_key: 'all_correct_bonus', rule_name: 'All Correct Bonus', points: 250, is_enabled: true },
  champion_prediction: { rule_key: 'champion_prediction', rule_name: 'Correct Tournament Champion', points: 250, is_enabled: true },
}

export async function loadScoringRules(): Promise<Record<string, ScoringRule>> {
  const supabase = createAdminClient()
  const { data: rules, error } = await supabase
    .from('scoring_rules')
    .select('*')

  const rulesMap: Record<string, ScoringRule> = { ...DEFAULT_SCORING_RULES }

  if (error) {
    console.error('Error loading scoring rules, using defaults:', error.message)
    return rulesMap
  }
  
  if (rules) {
    rules.forEach(rule => {
      rulesMap[rule.rule_key] = rule.is_enabled
        ? rule
        : { ...rule, points: 0 }
    })
  }

  rulesMap.tournament_champion = rulesMap.champion_prediction ?? rulesMap.tournament_champion

  return rulesMap
}
