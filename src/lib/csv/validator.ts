import { z } from 'zod'
import { CsvRow, LimitedCsvRow, ValidationError, ValidationResult } from '@/types/predictions'
import { TOURNAMENT_STAGES } from '../constants'
import { parseGoalScorers, parseJerseyNumbers } from './parser'
import { normalizeTeamName } from '../teams'

type MatchReference = {
  match_code: string
  home_team: string
  away_team: string
  stage?: string
}

const predictionRowSchema = z.object({
  match_id: z.string().min(1, "Match ID is required"),
  predicted_winner: z.string().min(1, "Predicted winner is required"),
  predicted_home_score: z.string().regex(/^\d+$/, "Home score must be a positive integer"),
  predicted_away_score: z.string().regex(/^\d+$/, "Away score must be a positive integer"),
  predicted_extra_time_home: z.string().regex(/^\d*$/, "Extra time home score must be a positive integer or empty").optional(),
  predicted_extra_time_away: z.string().regex(/^\d*$/, "Extra time away score must be a positive integer or empty").optional(),
  predicted_penalty_home: z.string().regex(/^\d*$/, "Penalty home score must be a positive integer or empty").optional(),
  predicted_penalty_away: z.string().regex(/^\d*$/, "Penalty away score must be a positive integer or empty").optional(),
  predicted_possession_home: z.string().regex(/^\d+(\.\d+)?$/, "Possession must be a number"),
  predicted_possession_away: z.string().regex(/^\d+(\.\d+)?$/, "Possession must be a number"),
  predicted_shots_home: z.string().regex(/^\d+$/, "Shots must be a positive integer"),
  predicted_shots_away: z.string().regex(/^\d+$/, "Shots must be a positive integer"),
  predicted_xg_home: z.string().regex(/^\d+(\.\d+)?$/, "xG must be a number"),
  predicted_xg_away: z.string().regex(/^\d+(\.\d+)?$/, "xG must be a number"),
  predicted_yellow_home: z.string().regex(/^\d+$/, "Yellow cards must be a positive integer"),
  predicted_yellow_away: z.string().regex(/^\d+$/, "Yellow cards must be a positive integer"),
  predicted_red_home: z.string().regex(/^\d+$/, "Red cards must be a positive integer"),
  predicted_red_away: z.string().regex(/^\d+$/, "Red cards must be a positive integer"),
  confidence: z.string().regex(/^(100|[1-9]?[0-9]|0(\.\d+)?|1(\.0+)?)$/, "Confidence must be between 0 and 100 (or 0 and 1)"),
})

const PLAYER_NAME_PATTERN = /^[A-Za-z .'-]+$/

function normalizedText(value: string | null | undefined) {
  if (!value) return ''
  return value.trim().toLowerCase()
}

function getMatchReference(validMatches: string[] | MatchReference[], matchId: string) {
  if (validMatches.length === 0 || typeof validMatches[0] === 'string') return null
  return (validMatches as MatchReference[]).find(match => match.match_code === matchId) || null
}

function getValidMatchIds(validMatches: string[] | MatchReference[]) {
  if (validMatches.length === 0 || typeof validMatches[0] === 'string') {
    return validMatches as string[]
  }
  return (validMatches as MatchReference[]).map(match => match.match_code)
}

function validateTeamName(row: CsvRow | LimitedCsvRow, rowNumber: number, matchRef: MatchReference | null, validTeams: Set<string>): ValidationError[] {
  const homeTeam = matchRef?.home_team || row.home_team
  const awayTeam = matchRef?.away_team || row.away_team

  if (!homeTeam || !awayTeam || normalizedText(row.predicted_winner) === 'draw') {
    return []
  }

  const winner = normalizeTeamName(row.predicted_winner)
  const home = normalizeTeamName(homeTeam)
  const away = normalizeTeamName(awayTeam)

  if (winner === home || winner === away || winner === 'home' || winner === 'away') return []
  if ((home === 'tbd' || away === 'tbd') && (validTeams.size === 0 || validTeams.has(winner))) return []

  return [{
    row: rowNumber,
    column: 'predicted_winner',
    message: `Predicted winner must be ${homeTeam}, ${awayTeam}, or draw`
  }]
}

function validatePlayerNames(row: CsvRow, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!row.predicted_goal_scorers) {
    if (row.predicted_first_goal_scorer && !PLAYER_NAME_PATTERN.test(row.predicted_first_goal_scorer)) {
      errors.push({
        row: rowNumber,
        column: 'predicted_first_goal_scorer',
        message: `Invalid first goal scorer: ${row.predicted_first_goal_scorer}`
      })
    }
    return errors
  }

  const scorerParts = row.predicted_goal_scorers.split(/[;,]/)

  scorerParts.forEach((part) => {
    const trimmed = part.trim()
    if (!trimmed) {
      errors.push({
        row: rowNumber,
        column: 'predicted_goal_scorers',
        message: `Empty scorer entry found. Remove trailing commas or extra semicolons.`
      })
      return
    }

    const [name, count] = part.split(':').map(value => value?.trim())
    
    if (!name || (count && !/^[1-9]\d*$/.test(count))) {
      errors.push({
        row: rowNumber,
        column: 'predicted_goal_scorers',
        message: `Goal scorer format invalid. Use Name or Name:Goals. Invalid value: ${part}`
      })
      return
    }

    if (!PLAYER_NAME_PATTERN.test(name)) {
      errors.push({
        row: rowNumber,
        column: 'predicted_goal_scorers',
        message: `Invalid player name: ${name}`
      })
    }
  })

  if (row.predicted_first_goal_scorer && !PLAYER_NAME_PATTERN.test(row.predicted_first_goal_scorer)) {
    errors.push({
      row: rowNumber,
      column: 'predicted_first_goal_scorer',
      message: `Invalid first goal scorer: ${row.predicted_first_goal_scorer}`
    })
  }

  return errors
}

export function validateCsv(
  rows: CsvRow[], 
  validMatches: string[] | MatchReference[]
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    predictions: []
  }

  const seenMatches = new Set<string>()
  const validMatchIds = getValidMatchIds(validMatches)
  const validTeams = new Set<string>()
  if (validMatches.length > 0 && typeof validMatches[0] !== 'string') {
    ;(validMatches as MatchReference[]).forEach(match => {
      validTeams.add(normalizeTeamName(match.home_team))
      validTeams.add(normalizeTeamName(match.away_team))
    })
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 2 // 1-indexed, accounting for header

    // Base schema validation
    const parsed = predictionRowSchema.safeParse(row)
    if (!parsed.success) {
      result.valid = false
      parsed.error.issues.forEach(err => {
        result.errors.push({
          row: rowNumber,
          column: err.path[0] as string,
          message: err.message
        })
      })
      return // Skip further validation for this row if base fails
    }

    const matchRef = getMatchReference(validMatches, row.match_id)
    const teamErrors = validateTeamName(row, rowNumber, matchRef, validTeams)
    const playerErrors = validatePlayerNames(row, rowNumber)
    if (teamErrors.length > 0 || playerErrors.length > 0) {
      result.valid = false
      result.errors.push(...teamErrors, ...playerErrors)
    }

    // Match ID validation
    if (!validMatchIds.includes(row.match_id)) {
      result.valid = false
      result.errors.push({
        row: rowNumber,
        column: 'match_id',
        message: `Invalid match ID: ${row.match_id}`
      })
    }

    // Duplicate match validation
    if (seenMatches.has(row.match_id)) {
      result.valid = false
      result.errors.push({
        row: rowNumber,
        column: 'match_id',
        message: `Duplicate prediction for match: ${row.match_id}`
      })
    }
    seenMatches.add(row.match_id)

    // Possession validation (must sum to 100)
    const possHome = parseFloat(row.predicted_possession_home)
    const possAway = parseFloat(row.predicted_possession_away)
    if (Number((possHome + possAway).toFixed(2)) !== 100) {
      result.valid = false
      result.errors.push({
        row: rowNumber,
        column: 'predicted_possession_home/away',
        message: `Possession must sum strictly to 100. Got ${possHome} + ${possAway}`
      })
    }

    // Map to ParsedPrediction if valid so far (we collect them even if some rows fail, 
    // but we won't insert to DB unless result.valid is true)
    if (result.valid) {
      result.predictions.push({
        match_id: row.match_id,
        predicted_home_team: row.home_team,
        predicted_away_team: row.away_team,
        winner: row.predicted_winner,
        home_score: parseInt(row.predicted_home_score, 10),
        away_score: parseInt(row.predicted_away_score, 10),
        extra_time_home: row.predicted_extra_time_home ? parseInt(row.predicted_extra_time_home, 10) : null,
        extra_time_away: row.predicted_extra_time_away ? parseInt(row.predicted_extra_time_away, 10) : null,
        penalty_home: row.predicted_penalty_home ? parseInt(row.predicted_penalty_home, 10) : null,
        penalty_away: row.predicted_penalty_away ? parseInt(row.predicted_penalty_away, 10) : null,
        goal_scorers: parseGoalScorers(row.predicted_goal_scorers),
        first_goal_scorer: row.predicted_first_goal_scorer || null,
        possession_home: possHome,
        possession_away: possAway,
        shots_home: parseInt(row.predicted_shots_home, 10),
        shots_away: parseInt(row.predicted_shots_away, 10),
        xg_home: parseFloat(row.predicted_xg_home),
        xg_away: parseFloat(row.predicted_xg_away),
        yellow_home: parseInt(row.predicted_yellow_home, 10),
        yellow_away: parseInt(row.predicted_yellow_away, 10),
        red_home: parseInt(row.predicted_red_home, 10),
        red_away: parseInt(row.predicted_red_away, 10),
        confidence: (() => {
          let conf = parseFloat(row.confidence)
          if (row.confidence.includes('.') && conf <= 1) {
            conf = Math.round(conf * 100)
          }
          return conf
        })()
      })
    }
  })

  // Missing matches validation
  const missingMatches = validMatchIds.filter(id => !seenMatches.has(id))
  if (missingMatches.length > 0) {
    result.valid = false
    result.errors.push({
      row: 0, // General error
      column: 'match_id',
      message: `Missing predictions for matches: ${missingMatches.join(', ')}`
    })
  }

  return result
}

/**
 * Limited-mode validation: each match needs an exact score and a set of scorer
 * jersey numbers per team. Rules:
 *  - home/away scores are non-negative integers
 *  - scorer entries are integers
 *  - the count of scorer numbers on each side must equal that side's score
 */
export function validateLimitedCsv(
  rows: LimitedCsvRow[],
  validMatches: string[] | MatchReference[]
): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], predictions: [] }

  const seenMatches = new Set<string>()
  const validMatchIds = getValidMatchIds(validMatches)
  const validTeams = new Set<string>()
  const stageToCodes = new Map<string, string[]>()
  if (validMatches.length > 0 && typeof validMatches[0] !== 'string') {
    ;(validMatches as MatchReference[]).forEach(match => {
      validTeams.add(normalizeTeamName(match.home_team))
      validTeams.add(normalizeTeamName(match.away_team))
      if (match.stage) {
        const stageLabel = TOURNAMENT_STAGES.find(s => s.value === match.stage)?.label || match.stage
        if (!stageToCodes.has(stageLabel)) stageToCodes.set(stageLabel, [])
        stageToCodes.get(stageLabel)!.push(match.match_code)
      }
    })
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 2 // 1-indexed + header

    const pushErr = (column: string, message: string) => {
      result.valid = false
      result.errors.push({ row: rowNumber, column, message })
    }

    // Match ID checks
    if (!row.match_id) {
      pushErr('match_id', 'Match ID is required')
      return
    }

    let mappedMatchId = row.match_id
    if (stageToCodes.has(row.match_id)) {
      const codes = stageToCodes.get(row.match_id)!
      if (codes.length > 0) {
        mappedMatchId = codes.shift()!
      } else {
        pushErr('match_id', `Too many predictions for stage: ${row.match_id}`)
        return
      }
    }
    row.match_id = mappedMatchId

    if (validMatchIds.length > 0 && !validMatchIds.includes(row.match_id)) {
      pushErr('match_id', `Invalid match ID: ${row.match_id}`)
    }
    if (seenMatches.has(row.match_id)) {
      pushErr('match_id', `Duplicate prediction for match: ${row.match_id}`)
    }
    seenMatches.add(row.match_id)

    if (!row.predicted_winner?.trim()) {
      pushErr('predicted_winner', 'Predicted winner is required')
    } else {
      const matchRef = getMatchReference(validMatches, row.match_id)
      const teamErrors = validateTeamName(row, rowNumber, matchRef, validTeams)
      if (teamErrors.length > 0) {
        result.valid = false
        result.errors.push(...teamErrors)
      }
    }

    // Scores must be non-negative integers
    const homeValid = /^\d+$/.test(row.predicted_home_score)
    const awayValid = /^\d+$/.test(row.predicted_away_score)
    if (!homeValid) pushErr('predicted_home_score', 'Home score must be a non-negative integer')
    if (!awayValid) pushErr('predicted_away_score', 'Away score must be a non-negative integer')

    // Jersey numbers must be integers
    const home = parseJerseyNumbers(row.predicted_scorers_home)
    const away = parseJerseyNumbers(row.predicted_scorers_away)
    if (home.invalid.length > 0) {
      pushErr('predicted_scorers_home', `Scorer jersey numbers must be integers. Invalid: ${home.invalid.join(', ')}`)
    }
    if (away.invalid.length > 0) {
      pushErr('predicted_scorers_away', `Scorer jersey numbers must be integers. Invalid: ${away.invalid.join(', ')}`)
    }

    // Scorer count must equal the predicted score for that side
    if (homeValid && home.invalid.length === 0) {
      const homeScore = parseInt(row.predicted_home_score, 10)
      if (home.numbers.length !== homeScore) {
        pushErr('predicted_scorers_home', `Home has ${home.numbers.length} scorer number(s) but predicted score is ${homeScore}. They must match.`)
      }
    }
    if (awayValid && away.invalid.length === 0) {
      const awayScore = parseInt(row.predicted_away_score, 10)
      if (away.numbers.length !== awayScore) {
        pushErr('predicted_scorers_away', `Away has ${away.numbers.length} scorer number(s) but predicted score is ${awayScore}. They must match.`)
      }
    }

    if (result.valid) {
      result.predictions.push({
        match_id: row.match_id,
        predicted_home_team: row.home_team,
        predicted_away_team: row.away_team,
        winner: row.predicted_winner,
        home_score: parseInt(row.predicted_home_score, 10),
        away_score: parseInt(row.predicted_away_score, 10),
        extra_time_home: null, extra_time_away: null,
        penalty_home: null, penalty_away: null,
        goal_scorers: null,
        first_goal_scorer: null,
        possession_home: null, possession_away: null,
        shots_home: null, shots_away: null,
        xg_home: null, xg_away: null,
        yellow_home: null, yellow_away: null,
        red_home: null, red_away: null,
        confidence: null,
        goal_scorers_jersey: { home: home.numbers, away: away.numbers },
      })
    }
  })

  const missingMatches = validMatchIds.filter(id => !seenMatches.has(id))
  if (missingMatches.length > 0) {
    result.valid = false
    result.errors.push({ row: 0, column: 'match_id', message: `Missing predictions for matches: ${missingMatches.join(', ')}` })
  }

  return result
}
