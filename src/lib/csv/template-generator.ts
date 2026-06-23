import Papa from 'papaparse'
import { CSV_COLUMNS, CSV_LIMITED_COLUMNS } from '../constants'
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

    // Pre-fill known data
    row.match_id = match.match_code
    row.home_team = match.home_team
    row.away_team = match.away_team

    return row
  })

  return Papa.unparse(templateRows, {
    header: true,
    columns
  })
}
