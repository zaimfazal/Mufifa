'use client'

import { CircleHelp } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ColumnHeaderHintProps {
  label: string
  hint: string
}

export function ColumnHeaderHint({ label, hint }: ColumnHeaderHintProps) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip>
        <TooltipTrigger
          className="inline-flex cursor-help text-muted-foreground/70 hover:text-muted-foreground"
          aria-label={`About ${label}`}
        >
          <CircleHelp className="h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-center">
          {hint}
        </TooltipContent>
      </Tooltip>
    </span>
  )
}

export const LEADERBOARD_COLUMN_HINTS = {
  outcome:
    'Points for predicting the correct match winner or draw.',
  scoreline:
    'Points for exact home/away goals and correct goal difference.',
  scorers:
    'Points for matching predicted goal-scorer jersey numbers.',
} as const

export const DASHBOARD_SCORE_HINTS = {
  outcome:
    'Points from home team (5), away team (5), and predicted winner (20) per match, scaled by stage multiplier.',
  scoreline:
    'Points for exact home/away goals and correct goal difference.',
  scorers:
    'Points for matching predicted goal-scorer jersey numbers.',
} as const
