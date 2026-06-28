'use client'

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
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
      return <div className="text-secondary">{formatPercentage(acc)}</div>
    },
  },
  {
    accessorKey: "winner_score",
    header: "Outcome",
    cell: ({ row }) => <div className="text-muted-foreground">{formatScore(row.getValue("winner_score"))}</div>,
  },
  {
    accessorKey: "scoreline_score",
    header: "Scoreline",
    cell: ({ row }) => <div className="text-muted-foreground">{formatScore(row.getValue("scoreline_score"))}</div>,
  },
  {
    accessorKey: "scorer_score",
    header: "Scorers",
    cell: ({ row }) => <div className="text-muted-foreground">{formatScore(row.getValue("scorer_score"))}</div>,
  },

]
