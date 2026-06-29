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

    // A stage label is not a match identity: several bracket slots share the
    // same stage and the teams in those slots are participant predictions.
    // Keep the stable unique slot code in every downloaded template.
    row.match_id = match.match_code
    if (limited) {
      row.stage = TOURNAMENT_STAGES.find(s => s.value === match.stage)?.label || match.stage
    }
    row.home_team = ''
    row.away_team = ''

    return row
  })

  return Papa.unparse(templateRows, {
    header: true,
    columns
  })
}
