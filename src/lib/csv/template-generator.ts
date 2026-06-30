import { CSV_COLUMNS, CSV_LIMITED_COLUMNS, TOURNAMENT_STAGES } from '../constants'
import { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export function generateTemplate(matches: MatchRow[], limited = false): string {
  const columns = limited ? CSV_LIMITED_COLUMNS : CSV_COLUMNS

  const templateRows = matches.map(match => {
    const stageLabel = TOURNAMENT_STAGES.find(s => s.value === match.stage)?.label || match.stage

    const rowValues = columns.map(col => {
      if (col === 'match_id') return `"${stageLabel}"`
      return ''
    })

    return rowValues.join(',')
  })

  return [columns.join(','), ...templateRows].join('\n')
}

