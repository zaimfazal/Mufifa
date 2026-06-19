/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { enterResult } from '@/actions/admin/results'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp } from 'lucide-react'

const resultSchema = z.object({
  winner: z.string(),
  home_score: z.coerce.number().min(0),
  away_score: z.coerce.number().min(0),
  possession_home: z.coerce.number().min(0).max(100),
  possession_away: z.coerce.number().min(0).max(100),
  shots_home: z.coerce.number().min(0),
  shots_away: z.coerce.number().min(0),
  xg_home: z.coerce.number().min(0),
  xg_away: z.coerce.number().min(0),
  yellow_home: z.coerce.number().min(0),
  yellow_away: z.coerce.number().min(0),
  red_home: z.coerce.number().min(0),
  red_away: z.coerce.number().min(0),
  penalty_home: z.string().optional(),
  penalty_away: z.string().optional(),
  goal_scorers: z.string().optional(),
  first_goal_scorer: z.string().optional(),
}).refine(data => {
  return data.possession_home + data.possession_away === 100
}, {
  message: "Possession must sum to 100",
  path: ["possession_home"]
})

export function ResultEntryForm({ match, existingResult }: { match: any, existingResult?: any }) {
  const [expanded, setExpanded] = useState(!existingResult)

  const defaultGoalScorers = existingResult?.goal_scorers 
    ? existingResult.goal_scorers.map((g: any) => `${g.name}:${g.goals}`).join(';') 
    : ''

  const form = useForm<z.infer<typeof resultSchema>>({
    resolver: zodResolver(resultSchema) as any,
    defaultValues: {
      winner: existingResult?.winner || 'draw',
      home_score: existingResult?.home_score ?? 0,
      away_score: existingResult?.away_score ?? 0,
      possession_home: existingResult?.possession_home ?? 50,
      possession_away: existingResult?.possession_away ?? 50,
      shots_home: existingResult?.shots_home ?? 0,
      shots_away: existingResult?.shots_away ?? 0,
      xg_home: existingResult?.xg_home ?? 0.0,
      xg_away: existingResult?.xg_away ?? 0.0,
      yellow_home: existingResult?.yellow_home ?? 0,
      yellow_away: existingResult?.yellow_away ?? 0,
      red_home: existingResult?.red_home ?? 0,
      red_away: existingResult?.red_away ?? 0,
      penalty_home: existingResult?.penalty_home?.toString() || '',
      penalty_away: existingResult?.penalty_away?.toString() || '',
      goal_scorers: defaultGoalScorers,
      first_goal_scorer: existingResult?.first_goal_scorer || '',
    }
  })

  async function onSubmit(values: z.infer<typeof resultSchema>) {
    const formData = new FormData()
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        formData.append(k, String(v))
      }
    })

    const res = await enterResult(match.id, formData)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Result saved and scores recalculated!')
      setExpanded(false)
    }
  }

  if (!expanded) {
    return (
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold font-mono text-accent">
          {existingResult?.home_score} - {existingResult?.away_score}
        </div>
        <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
          Edit Result <ChevronDown className="ml-2 w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="sm" onClick={() => setExpanded(false)} type="button">
            Collapse <ChevronUp className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Primary Outcome */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/10 rounded-lg border border-border/50">
          <FormField control={form.control} name="home_score" render={({ field }) => (
            <FormItem><FormLabel>{match.home_team} Score</FormLabel><FormControl><Input type="number" {...field} className="text-center text-xl font-bold" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="winner" render={({ field }) => (
            <FormItem>
              <FormLabel>Winner</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger className="text-center"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="home">{match.home_team}</SelectItem>
                  <SelectItem value="draw">Draw</SelectItem>
                  <SelectItem value="away">{match.away_team}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="away_score" render={({ field }) => (
            <FormItem><FormLabel>{match.away_team} Score</FormLabel><FormControl><Input type="number" {...field} className="text-center text-xl font-bold" /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        {/* Scorers & Penalties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold border-b border-border/50 pb-2">Player Events</h4>
            <FormField control={form.control} name="goal_scorers" render={({ field }) => (
              <FormItem><FormLabel>Goal Scorers (Format: &quot;Mbappe:2; Messi:1&quot;)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="first_goal_scorer" render={({ field }) => (
              <FormItem><FormLabel>First Goal Scorer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold border-b border-border/50 pb-2">Penalties (If applicable)</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="penalty_home" render={({ field }) => (
                <FormItem><FormLabel>{match.home_team} Penalties</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="penalty_away" render={({ field }) => (
                <FormItem><FormLabel>{match.away_team} Penalties</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </div>
        </div>

        {/* Match Statistics */}
        <div className="space-y-4">
          <h4 className="font-semibold border-b border-border/50 pb-2">Match Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <FormField control={form.control} name="possession_home" render={({ field }) => (
              <FormItem><FormLabel>Possession H (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="possession_away" render={({ field }) => (
              <FormItem><FormLabel>Possession A (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="shots_home" render={({ field }) => (
              <FormItem><FormLabel>Shots H</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="xg_home" render={({ field }) => (
              <FormItem><FormLabel>xG H</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="yellow_home" render={({ field }) => (
              <FormItem><FormLabel>Yellow H</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="red_home" render={({ field }) => (
              <FormItem><FormLabel>Red H</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
            <div className="col-span-2"></div>
            <FormField control={form.control} name="shots_away" render={({ field }) => (
              <FormItem><FormLabel>Shots A</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="xg_away" render={({ field }) => (
              <FormItem><FormLabel>xG A</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="yellow_away" render={({ field }) => (
              <FormItem><FormLabel>Yellow A</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="red_away" render={({ field }) => (
              <FormItem><FormLabel>Red A</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>
        
        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-4" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving & Recalculating...' : 'Save Result & Recalculate Scores'}
        </Button>
      </form>
    </Form>
  )
}


