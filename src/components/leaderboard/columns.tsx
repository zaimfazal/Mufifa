'use client'

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatScore, formatPercentage } from "@/lib/utils"

export type LeaderboardRow = {
  id: string
  rank: number | null
  team_name: string
  total_score: number
  accuracy: number
  winner_score: number
  scoreline_score: number
  scorer_score: number
  stats_score: number
  champion_score: number
}

function MetricHeader({ label, details }: { label: string; details: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span>{label}</span>
      <span
        title={details}
        aria-label={`${label} scoring details`}
        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-accent"
      >
        <Info className="size-3.5" />
      </span>
    </div>
  )
}

export const columns: ColumnDef<LeaderboardRow>[] = [
  {
    accessorKey: "rank",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent hover:text-accent p-0"
        >
          Rank
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const rank = row.getValue("rank") as number | null
      return <div className="font-mono font-bold">{rank ? `#${rank}` : '-'}</div>
    },
  },
  {
    accessorKey: "team_name",
    header: "Nickname",
    cell: ({ row }) => {
      return <div className="font-semibold text-foreground">{row.getValue("team_name")}</div>
    },
  },
  {
    accessorKey: "total_score",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent hover:text-accent p-0"
        >
          Total Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const score = row.getValue("total_score") as number
      return <div className="font-mono text-accent font-bold">{formatScore(score)}</div>
    },
  },
  {
    accessorKey: "accuracy",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent hover:text-accent p-0"
        >
          Accuracy
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const acc = row.getValue("accuracy") as number
      return <div className="font-medium text-foreground">{formatPercentage(acc)}</div>
    },
  },
  {
    accessorKey: "winner_score",
    header: () => (
      <MetricHeader
        label="Winner"
        details="Includes home team correct, away team correct, and predicted winner correct. Displayed points include the match stage multiplier."
      />
    ),
    cell: ({ row }) => <div className="text-muted-foreground">{formatScore(row.getValue("winner_score"))}</div>,
  },
  {
    accessorKey: "scoreline_score",
    header: () => (
      <MetricHeader
        label="Scoreline"
        details="Includes home goals correct, away goals correct, and goal difference correct. Displayed points include the match stage multiplier."
      />
    ),
    cell: ({ row }) => <div className="text-muted-foreground">{formatScore(row.getValue("scoreline_score"))}</div>,
  },
  {
    accessorKey: "scorer_score",
    header: () => (
      <MetricHeader
        label="Scorers"
        details="Includes home scorer jersey matches, away scorer jersey matches, and all-correct bonus. Home and away scorer points are calculated independently when that side's score is correct."
      />
    ),
    cell: ({ row }) => <div className="text-muted-foreground">{formatScore(row.getValue("scorer_score"))}</div>,
  },

]
