import { Database } from '@/types/database'
import { ScoringRule, MatchScoreResult } from '@/types/scoring'
import { GoalScorer } from '@/types/predictions'
import { SCORING_TOLERANCES } from '../constants'
import { normalizePlayerName } from '../csv/name-normalizer'

type Prediction = Database['public']['Tables']['predictions']['Row']
type Actual = Database['public']['Tables']['actual_results']['Row']

function normalizeOutcome(value: string | null, actual: Actual): string | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized === 'draw') return 'draw'
  if (normalized === 'home' || normalized === 'away') return normalized

  const match = (actual as Actual & { matches?: { home_team?: string | null; away_team?: string | null } | null }).matches
  if (match?.home_team && normalized === match.home_team.trim().toLowerCase()) return 'home'
  if (match?.away_team && normalized === match.away_team.trim().toLowerCase()) return 'away'

  return normalized
}

export function calculateOutcomeScore(prediction: Prediction, actual: Actual, rules: Record<string, ScoringRule>) {
  const predictedWinner = normalizeOutcome(prediction.winner, actual)
  const actualWinner = normalizeOutcome(actual.winner, actual)

  if (actualWinner === 'draw' && predictedWinner === 'draw') {
    return { points: rules['correct_draw']?.points || 0, type: 'draw' }
  }
  if (actualWinner !== 'draw' && predictedWinner === actualWinner) {
    return { points: rules['correct_winner']?.points || 0, type: 'winner' }
  }
  return { points: 0, type: 'none' }
}

function getFinalScore(record: { home_score: number | null, away_score: number | null, extra_time_home: number | null, extra_time_away: number | null }) {
  if (record.extra_time_home !== null && record.extra_time_away !== null) {
    return { home: record.extra_time_home, away: record.extra_time_away }
  }
  return { home: record.home_score, away: record.away_score }
}

export function calculateScorelineScore(prediction: Prediction, actual: Actual, rules: Record<string, ScoringRule>) {
  if (prediction.home_score === null || prediction.away_score === null || 
      actual.home_score === null || actual.away_score === null) return 0

  const pScore = getFinalScore(prediction)
  const aScore = getFinalScore(actual)
  
  if (pScore.home === null || pScore.away === null || aScore.home === null || aScore.away === null) return 0

  if (pScore.home === aScore.home && pScore.away === aScore.away) {
    return rules['exact_scoreline']?.points || 0
  }

  const predDiff = pScore.home - pScore.away
  const actualDiff = aScore.home - aScore.away

  if (predDiff === actualDiff) {
    return rules['correct_goal_difference']?.points || 0
  }

  if (pScore.home === aScore.home || pScore.away === aScore.away) {
    return rules['one_team_score_correct']?.points || 0
  }

  return 0
}

export function calculateScorerScore(prediction: Prediction, actual: Actual, rules: Record<string, ScoringRule>) {
  let points = 0
  if (!prediction.goal_scorers || !actual.goal_scorers) return 0

  const isOwnGoal = (name: string) => name.toLowerCase().includes('own goal') || name.toLowerCase() === 'og'
  
  const predScorers = (prediction.goal_scorers as GoalScorer[]).filter(s => !isOwnGoal(s.name))
  const actualScorers = (actual.goal_scorers as GoalScorer[]).filter(s => !isOwnGoal(s.name))
  const actualPlayerNames = actualScorers.map(s => s.name)

  let allPerfect = true
  let foundAny = false

  for (const ps of predScorers) {
    const normalizedName = normalizePlayerName(ps.name, actualPlayerNames, 3)
    if (normalizedName) {
      foundAny = true
      points += rules['correct_scorer']?.points || 0
      
      const actualScorer = actualScorers.find(a => a.name === normalizedName)
      if (actualScorer && actualScorer.goals === ps.goals) {
        points += rules['correct_goal_count']?.points || 0
      } else {
        allPerfect = false
      }
    } else {
      allPerfect = false
    }
  }

  // Exact list check: predicted all correctly and didn't predict extra, and didn't miss any
  if (foundAny && allPerfect && predScorers.length === actualScorers.length) {
    points += rules['exact_scorer_list']?.points || 0
  }

  if (prediction.first_goal_scorer && actual.first_goal_scorer) {
    const normalizedFirst = normalizePlayerName(prediction.first_goal_scorer, [actual.first_goal_scorer], 3)
    if (normalizedFirst) {
      points += rules['first_goal_scorer']?.points || 0
    }
  }

  return points
}

export function calculateStatsScore(prediction: Prediction, actual: Actual, rules: Record<string, ScoringRule>) {
  let points = 0

  if (prediction.possession_home !== null && actual.possession_home !== null) {
    if (Math.abs(prediction.possession_home - actual.possession_home) <= SCORING_TOLERANCES.possession) {
      points += rules['possession_accuracy']?.points || 0
    }
  }

  if (prediction.shots_home !== null && actual.shots_home !== null && prediction.shots_away !== null && actual.shots_away !== null) {
    if (Math.abs(prediction.shots_home - actual.shots_home) <= SCORING_TOLERANCES.shots &&
        Math.abs(prediction.shots_away - actual.shots_away) <= SCORING_TOLERANCES.shots) {
      points += rules['shots_accuracy']?.points || 0
    }
  }

  if (prediction.xg_home !== null && actual.xg_home !== null && prediction.xg_away !== null && actual.xg_away !== null) {
    if (Math.abs(prediction.xg_home - actual.xg_home) <= SCORING_TOLERANCES.xg &&
        Math.abs(prediction.xg_away - actual.xg_away) <= SCORING_TOLERANCES.xg) {
      points += rules['xg_accuracy']?.points || 0
    }
  }

  if (prediction.yellow_home !== null && actual.yellow_home !== null && prediction.yellow_away !== null && actual.yellow_away !== null) {
    if (Math.abs(prediction.yellow_home - actual.yellow_home) <= SCORING_TOLERANCES.yellowCards &&
        Math.abs(prediction.yellow_away - actual.yellow_away) <= SCORING_TOLERANCES.yellowCards) {
      points += rules['yellow_cards_accuracy']?.points || 0
    }
  }

  if (prediction.red_home !== null && actual.red_home !== null && prediction.red_away !== null && actual.red_away !== null) {
    if (prediction.red_home === actual.red_home && prediction.red_away === actual.red_away) {
      points += rules['red_cards_exact']?.points || 0
    }
  }

  return points
}

export function calculatePenaltyScore(prediction: Prediction, actual: Actual, rules: Record<string, ScoringRule>) {
  if (actual.penalty_home === null && actual.penalty_away === null) return 0
  let points = 0

  // Penalty winner
  const actualPenWinner = (actual.penalty_home || 0) > (actual.penalty_away || 0) ? 'home' : 'away'
  const predPenWinner = (prediction.penalty_home || 0) > (prediction.penalty_away || 0) ? 'home' : 
                        ((prediction.penalty_away || 0) > (prediction.penalty_home || 0) ? 'away' : null)

  if (predPenWinner === actualPenWinner) {
    points += rules['penalty_winner']?.points || 0
  }

  if (prediction.penalty_home === actual.penalty_home && prediction.penalty_away === actual.penalty_away) {
    points += rules['penalty_score']?.points || 0
  }

  return points
}

export function calculateConfidenceScore(prediction: Prediction, actual: Actual, rules: Record<string, ScoringRule>) {
  if (prediction.confidence === null || prediction.confidence <= 80) return 0

  const predictedWinner = normalizeOutcome(prediction.winner, actual)
  const actualWinner = normalizeOutcome(actual.winner, actual)
  const isWinnerCorrect = (actualWinner !== 'draw' && predictedWinner === actualWinner) ||
                          (actualWinner === 'draw' && predictedWinner === 'draw')

  if (isWinnerCorrect) {
    return rules['confidence_bonus']?.points || 0
  } else {
    return rules['confidence_penalty']?.points || 0
  }
}

export function calculateMaxPossibleScore(rules: Record<string, ScoringRule>, multiplier: number, actual: Actual): number {
  let max = 0
  const hasPenalties = actual.penalty_home !== null || actual.penalty_away !== null
  
  // Best outcome
  max += Math.max(rules['correct_winner']?.points || 0, rules['correct_draw']?.points || 0)
  // Best scoreline
  max += rules['exact_scoreline']?.points || 0
  
  // Best scorer dynamically calculated based on actual match scorers
  const actualScorers = actual.goal_scorers 
    ? (actual.goal_scorers as GoalScorer[]).filter(s => !s.name.toLowerCase().includes('own goal') && s.name.toLowerCase() !== 'og') 
    : []
  
  if (actualScorers.length > 0) {
    const scorerCount = actualScorers.length
    max += scorerCount * (rules['correct_scorer']?.points || 0)
    max += scorerCount * (rules['correct_goal_count']?.points || 0)
    max += rules['exact_scorer_list']?.points || 0
  }
  
  if (actual.first_goal_scorer) {
    max += rules['first_goal_scorer']?.points || 0
  }

  // Best stats
  max += (rules['possession_accuracy']?.points || 0) + (rules['shots_accuracy']?.points || 0) + (rules['xg_accuracy']?.points || 0) + (rules['yellow_cards_accuracy']?.points || 0) + (rules['red_cards_exact']?.points || 0)
  
  // Penalties
  if (hasPenalties) {
    max += (rules['penalty_winner']?.points || 0) + (rules['penalty_score']?.points || 0)
  }
  
  // Confidence
  max += rules['confidence_bonus']?.points || 0
  
  return max * multiplier
}

export function calculateMatchScore(prediction: Prediction, actual: Actual, rules: Record<string, ScoringRule>, multiplier: number): MatchScoreResult {
  const outcome = calculateOutcomeScore(prediction, actual, rules).points
  const scoreline = calculateScorelineScore(prediction, actual, rules)
  const scorer = calculateScorerScore(prediction, actual, rules)
  const stats = calculateStatsScore(prediction, actual, rules)
  const penalty = calculatePenaltyScore(prediction, actual, rules)
  const confidence = calculateConfidenceScore(prediction, actual, rules)

  const unmultipliedTotal = outcome + scoreline + scorer + stats + penalty + confidence
  const multipliedTotal = unmultipliedTotal * multiplier
  const maxPossible = calculateMaxPossibleScore(rules, multiplier, actual)

  return {
    total: unmultipliedTotal,
    multipliedTotal,
    breakdown: {
      outcome: outcome * multiplier,
      scoreline: scoreline * multiplier,
      scorer: scorer * multiplier,
      stats: stats * multiplier,
      penalty: penalty * multiplier,
      confidence: confidence * multiplier
    },
    multiplier,
    maxPossible
  }
}

export function calculateChampionScore(predicted: string, actual: string, rules: Record<string, ScoringRule>) {
  if (!predicted || !actual) return 0
  if (normalizePlayerName(predicted, [actual], 3)) {
    return rules['champion_prediction']?.points || 0
  }
  return 0
}
