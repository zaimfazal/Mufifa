import Papa from 'papaparse'
import { CsvRow, GoalScorer } from '@/types/predictions'
import { CSV_COLUMNS, LEGACY_CSV_COLUMNS } from '../constants'

type RawCsvRow = Record<string, string | undefined>
type CsvStringColumn = Exclude<keyof CsvRow, '__requiresChampion'>

const LEGACY_TO_CURRENT_COLUMN: Record<string, CsvStringColumn> = {
  winner: 'predicted_winner',
  home_score: 'predicted_home_score',
  away_score: 'predicted_away_score',
  extra_time_home: 'predicted_extra_time_home',
  extra_time_away: 'predicted_extra_time_away',
  penalty_home: 'predicted_penalty_home',
  penalty_away: 'predicted_penalty_away',
  goal_scorers: 'predicted_goal_scorers',
  first_goal_scorer: 'predicted_first_goal_scorer',
  possession_home: 'predicted_possession_home',
  possession_away: 'predicted_possession_away',
  shots_on_target_home: 'predicted_shots_home',
  shots_on_target_away: 'predicted_shots_away',
  xg_home: 'predicted_xg_home',
  xg_away: 'predicted_xg_away',
  yellow_cards_home: 'predicted_yellow_home',
  yellow_cards_away: 'predicted_yellow_away',
  red_cards_home: 'predicted_red_home',
  red_cards_away: 'predicted_red_away',
  confidence: 'confidence',
  match_id: 'match_id',
}

function emptyCsvRow(requiresChampion: boolean): CsvRow {
  return {
    __requiresChampion: requiresChampion,
    match_id: '',
    home_team: '',
    away_team: '',
    predicted_winner: '',
    predicted_home_score: '',
    predicted_away_score: '',
    predicted_extra_time_home: '',
    predicted_extra_time_away: '',
    predicted_penalty_home: '',
    predicted_penalty_away: '',
    predicted_goal_scorers: '',
    predicted_first_goal_scorer: '',
    predicted_possession_home: '',
    predicted_possession_away: '',
    predicted_shots_home: '',
    predicted_shots_away: '',
    predicted_xg_home: '',
    predicted_xg_away: '',
    predicted_yellow_home: '',
    predicted_yellow_away: '',
    predicted_red_home: '',
    predicted_red_away: '',
    confidence: '',
    tournament_champion: '',
  }
}

function normalizeRows(rows: RawCsvRow[], uploadedColumns: string[]): CsvRow[] {
  const isLegacyFormat = uploadedColumns.includes('winner') && !uploadedColumns.includes('predicted_winner')
  const requiresChampion = uploadedColumns.includes('tournament_champion')

  return rows.map((row) => {
    const normalized = emptyCsvRow(requiresChampion)

    if (isLegacyFormat) {
      Object.entries(LEGACY_TO_CURRENT_COLUMN).forEach(([legacyColumn, currentColumn]) => {
        normalized[currentColumn] = row[legacyColumn]?.trim() || ''
      })
      return normalized
    }

    CSV_COLUMNS.forEach((column) => {
      normalized[column as CsvStringColumn] = row[column]?.trim() || ''
    })
    return normalized
  })
}

export function parseCsvText(text: string): { rows: CsvRow[]; errors: string[] } {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  const errors: string[] = []
  
  // Check if required columns exist
  const uploadedColumns = result.meta.fields || []
  const acceptedColumns = uploadedColumns.includes('winner') ? LEGACY_CSV_COLUMNS : CSV_COLUMNS
  const missingColumns = acceptedColumns.filter(col => !uploadedColumns.includes(col))
  
  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`)
  }

  const rows = normalizeRows(result.data as RawCsvRow[], uploadedColumns)

  return { rows, errors }
}

export function parseGoalScorers(str: string): GoalScorer[] {
  if (!str || str.trim() === '') return []
  
  const scorers: GoalScorer[] = []
  const parts = str.split(';')
  
  for (const part of parts) {
    if (!part.trim()) continue
    
    const [name, countStr] = part.split(':')
    if (name && countStr) {
      const goals = parseInt(countStr.trim(), 10)
      if (!isNaN(goals) && goals > 0) {
        scorers.push({ name: name.trim(), goals })
      }
    }
  }
  
  return scorers
}
