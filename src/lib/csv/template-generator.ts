import { CSV_COLUMNS, CSV_LIMITED_COLUMNS, TOURNAMENT_STAGES } from '../constants'
import { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export function generateTemplate(matches: MatchRow[], limited = false): string {
  const columns = limited ? CSV_LIMITED_COLUMNS : CSV_COLUMNS

  // Insert 'stage' as a reference-only column right after 'match_id'
  const templateColumns = [
    columns[0], // match_id
    'stage',
    ...columns.slice(1),
  ]

  const templateRows = matches.map(match => {
    const stageLabel = TOURNAMENT_STAGES.find(s => s.value === match.stage)?.label || match.stage

    const rowValues = templateColumns.map(col => {
      if (col === 'match_id') return `"${match.match_code}"`
      if (col === 'stage') return `"${stageLabel}"`
      if (col === 'home_team') return `"${match.home_team}"`
      if (col === 'away_team') return `"${match.away_team}"`
      return ''
    })

    return rowValues.join(',')
  })

  return [templateColumns.join(','), ...templateRows].join('\n')
}

