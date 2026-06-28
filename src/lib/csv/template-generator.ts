import Papa from 'papaparse'
import { CSV_COLUMNS, CSV_LIMITED_COLUMNS, TOURNAMENT_STAGES } from '../constants'
import { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export function generateTemplate(matches: MatchRow[], limited = false): string {
  const columns = limited ? CSV_LIMITED_COLUMNS : CSV_COLUMNS

  const templateRows = matches.map(match => {
    const row: Record<string, string> = {}

    // Initialize all columns with empty strings
    columns.forEach(col => {
      row[col] = ''
    })

    const stageLabel = TOURNAMENT_STAGES.find(s => s.value === match.stage)?.label || match.stage

    // Pre-fill known data
    row.match_id = stageLabel
    row.home_team = ''
    row.away_team = ''

    return row
  })

  return Papa.unparse(templateRows, {
    header: true,
    columns
  })
}
