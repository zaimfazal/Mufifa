/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Info, Trophy, Medal } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatScore, formatPercentage } from "@/lib/utils"

interface LeaderboardTableProps {
  data: any[]
}

function MetricHeader({ label, details }: { label: string; details: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span>{label}</span>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              aria-label={`${label} scoring details`}
            />
          }
        >
          <Info className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-72 text-left leading-relaxed">
          {details}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export function LeaderboardTable({ data }: LeaderboardTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'rank', desc: false }
  ])

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "rank",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="hover:bg-transparent hover:text-accent p-0">
          Rank <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rank = row.getValue("rank") as number | null
        if (!rank) return <div>-</div>
        
        let icon = null
        if (rank === 1) icon = <Trophy className="w-4 h-4 text-yellow-500 mr-2 inline" />
        else if (rank === 2) icon = <Medal className="w-4 h-4 text-gray-400 mr-2 inline" />
        else if (rank === 3) icon = <Medal className="w-4 h-4 text-amber-700 mr-2 inline" />

        return <div className="font-mono font-bold whitespace-nowrap">{icon}#{rank}</div>
      },
    },
    {
      accessorKey: "team_name",
      header: "Nickname",
      cell: ({ row }) => {
        const rank = row.getValue("rank") as number | null
        const isTop3 = rank && rank <= 3
        return <div className={`font-semibold ${isTop3 ? 'text-accent' : 'text-foreground'}`}>{row.getValue("team_name")}</div>
      },
    },
    {
      accessorKey: "total_score",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="hover:bg-transparent hover:text-accent p-0">
          Total Points <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono text-accent font-bold">{formatScore(row.getValue("total_score") as number)}</div>,
    },
    {
      accessorKey: "accuracy",
      header: "Accuracy %",
      cell: ({ row }) => (
        <div className="font-medium text-foreground">
          {formatPercentage(row.getValue("accuracy") as number)}
        </div>
      ),
    },
    {
      accessorKey: "winner_score",
      header: () => (
        <MetricHeader
          label="Winner"
          details="Includes home team correct, away team correct, and predicted winner correct. Displayed points include the match stage multiplier."
        />
      ),
      cell: ({ row }) => <div className="text-muted-foreground">{formatScore(row.getValue("winner_score") as number)}</div>,
    },
    {
      accessorKey: "scoreline_score",
      header: () => (
        <MetricHeader
          label="Scoreline"
          details="Includes home goals correct, away goals correct, and goal difference correct. Displayed points include the match stage multiplier."
        />
      ),
      cell: ({ row }) => <div className="text-muted-foreground">{formatScore(row.getValue("scoreline_score") as number)}</div>,
    },
    {
      accessorKey: "scorer_score",
      header: () => (
        <MetricHeader
          label="Scorers"
          details="Includes home scorer jersey matches, away scorer jersey matches, and all-correct bonus. Home and away scorer points are calculated independently when that side's score is correct."
        />
      ),
      cell: ({ row }) => <div className="text-muted-foreground">{formatScore(row.getValue("scorer_score") as number)}</div>,
    },

  ]

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <TooltipProvider>
      <div className="rounded-md border border-border/50 overflow-hidden bg-card/50 backdrop-blur">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground font-semibold whitespace-nowrap">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-border/50 transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No predictions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  )
}

