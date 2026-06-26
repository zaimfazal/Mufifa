import { Database } from '@/types/database'
import { ScoringRule, MatchScoreResult } from '@/types/scoring'
import { normalizePlayerName } from '../csv/name-normalizer'

type Prediction = Database['public']['Tables']['predictions']['Row']
type Actual = Database['public']['Tables']['actual_results']['Row']

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a winner value ("home", "away", "draw", or a team name) to a
 * canonical form so comparisons work regardless of how the user expressed it.
 */
function normalizeOutcome(value: string | null, actual: Actual): string | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized === 'draw') return 'draw'
  if (normalized === 'home' || normalized === 'away') return normalized

  const match = (
    actual as Actual & {
      matches?: { home_team?: string | null; away_team?: string | null } | null
    }
  ).matches
  if (match?.home_team && normalized === match.home_team.trim().toLowerCase()) return 'home'
  if (match?.away_team && normalized === match.away_team.trim().toLowerCase()) return 'away'

  return normalized
}

type JerseyObj = { home?: unknown; away?: unknown }

/** Convert an unknown array-like value to a de-duped Set<number>. */
function toJerseySet(value: unknown): Set<number> {
  const arr = Array.isArray(value) ? value : []
  const set = new Set<number>()
  for (const v of arr) {
    const n = typeof v === 'number' ? v : parseInt(String(v), 10)
    if (!Number.isNaN(n)) set.add(n)
  }
  return set
}

/** Extract the jersey-number set for one side from a goal_scorers JSONB value. */
function getJerseySet(goalScorers: unknown, side: 'home' | 'away'): Set<number> {
  if (!goalScorers || typeof goalScorers !== 'object' || Array.isArray(goalScorers)) {
    return new Set()
  }
  return toJerseySet((goalScorers as JerseyObj)[side])
}

// ---------------------------------------------------------------------------
// Rule 7 / 8 — fractional scorer matching
// ---------------------------------------------------------------------------

interface ScorerResult {
  points: number
  /** true only when fraction == 1.0 AND predicted-count == actual-count */
  perfect: boolean
}

/**
 * Fractional scorer credit for one side.
 *
 * credit = (# correct predicted jersey numbers / total predicted jersey numbers) × full marks
 *
 * Validity check: if predicted-count > predicted-goals → 0 pts (shouldn't
 * happen after submission validation, but we guard anyway).
 *
 * 0-0 case: both sets empty → full marks (perfect prediction).
 */
function scorerMatchPoints(
  prediction: Prediction,
  actual: Actual,
  rules: Record<string, ScoringRule>,
  side: 'home' | 'away'
): ScorerResult {
  const fullMarks = rules[`scorer_match_${side}`]?.points || 0
  if (fullMarks === 0) return { points: 0, perfect: false }

  const predictedGoals =
    side === 'home' ? (prediction.home_score ?? 0) : (prediction.away_score ?? 0)

  const predSet = getJerseySet(prediction.goal_scorers, side)
  const actSet = getJerseySet(actual.goal_scorers, side)

  // Validity guard
  if (predSet.size > predictedGoals) return { points: 0, perfect: false }

  // 0-0: both sides have no scorers → perfect
  if (predSet.size === 0 && actSet.size === 0) return { points: fullMarks, perfect: true }

  // No scorers predicted but actual has some (gating should prevent this)
  if (predSet.size === 0) return { points: 0, perfect: false }

  let correct = 0
  for (const n of predSet) {
    if (actSet.has(n)) correct++
  }

  const fraction = correct / predSet.size
  // perfect = every predicted jersey is correct AND no actual jerseys were missed
  const perfect = fraction === 1.0 && predSet.size === actSet.size

  return { points: fraction * fullMarks, perfect }
}

// ---------------------------------------------------------------------------
// Max-possible per match
// ---------------------------------------------------------------------------

export function calculateMaxPossibleScore(
  rules: Record<string, ScoringRule>,
  multiplier: number
): number {
  const KEYS = [
    'home_team_correct',
    'away_team_correct',
    'predicted_winner_correct',
    'home_goals_correct',
    'away_goals_correct',
    'goal_difference_correct',
    'scorer_match_home',
    'scorer_match_away',
    'all_correct_bonus',
  ]
  const perMatchMax = KEYS.reduce((sum, k) => sum + (rules[k]?.points || 0), 0)
  return perMatchMax * multiplier
}

// ---------------------------------------------------------------------------
// Main match scoring function (new 9-rule system)
// ---------------------------------------------------------------------------

/**
 * Score one prediction against one actual result using the 9 new rules.
 *
 * Breakdown columns are mapped to the existing leaderboard DB columns so no
 * schema migration is needed:
 *   outcome   ← home_team_correct + away_team_correct + predicted_winner_correct
 *   scoreline ← home_goals_correct + away_goals_correct + goal_difference_correct
 *   scorer    ← scorer_match_home  + scorer_match_away  + all_correct_bonus
 *   stats / penalty / confidence → always 0 (rules disabled)
 */
export function calculateMatchScore(
  prediction: Prediction,
  actual: Actual,
  rules: Record<string, ScoringRule>,
  multiplier: number
): MatchScoreResult {
  // ── Rules 1 & 2: home_team_correct / away_team_correct ───────────────────
  // The submission template is generated from the DB and team names are
  // validated at upload time, so these are always satisfied.
  const homeTeamPts = rules['home_team_correct']?.points || 0
  const awayTeamPts = rules['away_team_correct']?.points || 0

  // ── Rule 3: predicted_winner_correct (gated on 1+2, always true) ─────────
  const predictedWinner = normalizeOutcome(prediction.winner, actual)
  const actualWinner = normalizeOutcome(actual.winner, actual)
  const winnerCorrect =
    predictedWinner !== null && actualWinner !== null && predictedWinner === actualWinner
  const winnerPts = winnerCorrect ? (rules['predicted_winner_correct']?.points || 0) : 0

  // ── Rules 4 & 5: home_goals_correct / away_goals_correct (gated on 1+2) ──
  const homeGoalsCorrect =
    prediction.home_score !== null &&
    actual.home_score !== null &&
    prediction.home_score === actual.home_score
  const awayGoalsCorrect =
    prediction.away_score !== null &&
    actual.away_score !== null &&
    prediction.away_score === actual.away_score
  const homeGoalsPts = homeGoalsCorrect ? (rules['home_goals_correct']?.points || 0) : 0
  const awayGoalsPts = awayGoalsCorrect ? (rules['away_goals_correct']?.points || 0) : 0

  // ── Rule 6: goal_difference_correct (gated on 1+2+3) ─────────────────────
  let goalDiffPts = 0
  if (
    winnerCorrect &&
    prediction.home_score !== null &&
    prediction.away_score !== null &&
    actual.home_score !== null &&
    actual.away_score !== null
  ) {
    const predDiff = prediction.home_score - prediction.away_score
    const actualDiff = actual.home_score - actual.away_score
    if (predDiff === actualDiff) {
      goalDiffPts = rules['goal_difference_correct']?.points || 0
    }
  }

  // ── Rules 7 & 8: scorer_match (gated on 4+5) ─────────────────────────────
  let scorerHomePts = 0
  let scorerHomePerfect = false
  let scorerAwayPts = 0
  let scorerAwayPerfect = false
  if (homeGoalsCorrect && awayGoalsCorrect) {
    const homeRes = scorerMatchPoints(prediction, actual, rules, 'home')
    scorerHomePts = homeRes.points
    scorerHomePerfect = homeRes.perfect
    const awayRes = scorerMatchPoints(prediction, actual, rules, 'away')
    scorerAwayPts = awayRes.points
    scorerAwayPerfect = awayRes.perfect
  }

  // ── Rule 9: all_correct_bonus ─────────────────────────────────────────────
  const allCorrect =
    winnerCorrect &&
    homeGoalsCorrect &&
    awayGoalsCorrect &&
    scorerHomePerfect &&
    scorerAwayPerfect
  const allBonusPts = allCorrect ? (rules['all_correct_bonus']?.points || 0) : 0

  // ── Aggregate ─────────────────────────────────────────────────────────────
  const outcomeScore = homeTeamPts + awayTeamPts + winnerPts
  const scorelineScore = homeGoalsPts + awayGoalsPts + goalDiffPts
  const scorerScore = scorerHomePts + scorerAwayPts + allBonusPts

  const unmultipliedTotal = outcomeScore + scorelineScore + scorerScore
  const multipliedTotal = unmultipliedTotal * multiplier
  const maxPossible = calculateMaxPossibleScore(rules, multiplier)

  return {
    total: unmultipliedTotal,
    multipliedTotal,
    breakdown: {
      outcome: outcomeScore * multiplier,
      scoreline: scorelineScore * multiplier,
      scorer: scorerScore * multiplier,
      stats: 0,
      penalty: 0,
      confidence: 0,
    },
    multiplier,
    maxPossible,
  }
}

// ---------------------------------------------------------------------------
// Champion prediction (unchanged)
// ---------------------------------------------------------------------------

export function calculateChampionScore(
  predicted: string,
  actual: string,
  rules: Record<string, ScoringRule>
): number {
  if (!predicted || !actual) return 0
  if (normalizePlayerName(predicted, [actual], 3)) {
    return rules['champion_prediction']?.points || 0
  }
  return 0
}
