/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface MatchPredictionsTableProps {
  data: any[]
}

export function MatchPredictionsTable({ data }: MatchPredictionsTableProps) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "match_code",
      header: "Match",
      cell: ({ row }) => (
        <div>
          <div className="font-mono text-xs text-muted-foreground">{row.getValue("match_code")}</div>
          <div className="font-semibold whitespace-nowrap">{row.original.home_team} vs {row.original.away_team}</div>
        </div>
      ),
    },
    {
      header: "Prediction",
      cell: ({ row }) => (
        <div className="text-sm">
          <span className="font-mono bg-muted px-2 py-1 rounded text-accent">
            {row.original.predicted_home_score} - {row.original.predicted_away_score}
          </span>
          <div className="text-muted-foreground mt-1 capitalize text-xs">{row.original.predicted_winner}</div>
        </div>
      ),
    },
    {
      header: "Actual Result",
      cell: ({ row }) => {
        if (row.original.status !== 'completed' || row.original.actual_home_score === null) {
          return <Badge variant="outline" className="text-muted-foreground"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
        }
        return (
          <div className="text-sm">
            <span className="font-mono bg-muted px-2 py-1 rounded">
              {row.original.actual_home_score} - {row.original.actual_away_score}
            </span>
            <div className="text-muted-foreground mt-1 capitalize text-xs">{row.original.actual_winner}</div>
          </div>
        )
      },
    },
    {
      header: "Status",
      cell: ({ row }) => {
        if (row.original.status !== 'completed' || row.original.actual_home_score === null) {
          return <div className="text-muted-foreground">-</div>
        }
        
        const isExactScore = row.original.predicted_home_score === row.original.actual_home_score && 
                             row.original.predicted_away_score === row.original.actual_away_score
        
        const isCorrectOutcome = row.original.predicted_winner === row.original.actual_winner

        if (isExactScore) {
          return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Exact</Badge>
        } else if (isCorrectOutcome) {
          return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Outcome</Badge>
        } else {
          return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Miss</Badge>
        }
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border border-border/50 overflow-hidden bg-card/50 backdrop-blur">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground font-semibold">
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
                    <TableCell key={cell.id} className="py-4">
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
  )
}

