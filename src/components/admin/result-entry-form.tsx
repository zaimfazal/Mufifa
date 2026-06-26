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
  scorers_home: z.string().optional(),
  scorers_away: z.string().optional(),
})

const limitedResultSchema = z.object({
  home_score: z.coerce.number().min(0),
  away_score: z.coerce.number().min(0),
  scorers_home: z.string().optional(),
  scorers_away: z.string().optional(),
})

export function ResultEntryForm({ match, existingResult, limited = false }: { match: any, existingResult?: any, limited?: boolean }) {
  if (limited) {
    return <LimitedResultEntryForm match={match} existingResult={existingResult} />
  }
  return <FullResultEntryForm match={match} existingResult={existingResult} />
}

function LimitedResultEntryForm({ match, existingResult }: { match: any, existingResult?: any }) {
  const [expanded, setExpanded] = useState(!existingResult)

  // goal_scorers in limited mode is { home: number[], away: number[] }
  const gs = existingResult?.goal_scorers
  const homeNums = Array.isArray(gs?.home) ? gs.home.join(';') : ''
  const awayNums = Array.isArray(gs?.away) ? gs.away.join(';') : ''

  const form = useForm<z.infer<typeof limitedResultSchema>>({
    resolver: zodResolver(limitedResultSchema) as any,
    defaultValues: {
      home_score: existingResult?.home_score ?? 0,
      away_score: existingResult?.away_score ?? 0,
      scorers_home: homeNums,
      scorers_away: awayNums,
    }
  })

  async function onSubmit(values: z.infer<typeof limitedResultSchema>) {
    const formData = new FormData()
    formData.append('home_score', String(values.home_score))
    formData.append('away_score', String(values.away_score))
    formData.append('scorers_home', values.scorers_home ?? '')
    formData.append('scorers_away', values.scorers_away ?? '')

    try {
      const res = await enterResult(match.id, formData)
      // Only reaches here if redirect didn't happen (i.e. error)
      if (res && res.error) toast.error(res.error)
    } catch {
      // redirect() throws a Next.js redirect — that's the success path, ignore it
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/10 rounded-lg border border-border/50">
          <FormField control={form.control} name="home_score" render={({ field }) => (
            <FormItem><FormLabel>{match.home_team} Score</FormLabel><FormControl><Input type="number" {...field} className="text-center text-xl font-bold" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="away_score" render={({ field }) => (
            <FormItem><FormLabel>{match.away_team} Score</FormLabel><FormControl><Input type="number" {...field} className="text-center text-xl font-bold" /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="scorers_home" render={({ field }) => (
            <FormItem><FormLabel>{match.home_team} Scorer Numbers (e.g. &quot;10;7&quot;)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="scorers_away" render={({ field }) => (
            <FormItem><FormLabel>{match.away_team} Scorer Numbers (e.g. &quot;9&quot;)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-4" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving & Recalculating...' : 'Save Result & Recalculate Scores'}
        </Button>
      </form>
    </Form>
  )
}

function FullResultEntryForm({ match, existingResult }: { match: any, existingResult?: any }) {
  const [expanded, setExpanded] = useState(!existingResult)

  const defaultScorersHome = Array.isArray(existingResult?.goal_scorers?.home)
    ? existingResult.goal_scorers.home.join(';')
    : ''
  const defaultScorersAway = Array.isArray(existingResult?.goal_scorers?.away)
    ? existingResult.goal_scorers.away.join(';')
    : ''

  const form = useForm<z.infer<typeof resultSchema>>({
    resolver: zodResolver(resultSchema) as any,
    defaultValues: {
      winner: existingResult?.winner || 'draw',
      home_score: existingResult?.home_score ?? 0,
      away_score: existingResult?.away_score ?? 0,
      scorers_home: defaultScorersHome,
      scorers_away: defaultScorersAway,
    }
  })

  async function onSubmit(values: z.infer<typeof resultSchema>) {
    const formData = new FormData()
    formData.append('winner', values.winner)
    formData.append('home_score', String(values.home_score))
    formData.append('away_score', String(values.away_score))
    formData.append('scorers_home', values.scorers_home ?? '')
    formData.append('scorers_away', values.scorers_away ?? '')

    try {
      const res = await enterResult(match.id, formData)
      // Only reaches here if redirect didn't happen (i.e. error)
      if (res && res.error) toast.error(res.error)
    } catch {
      // redirect() throws a Next.js redirect — that's the success path, ignore it
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

        {/* Scorers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="scorers_home" render={({ field }) => (
            <FormItem><FormLabel>{match.home_team} Scorers (e.g. 10;7)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="scorers_away" render={({ field }) => (
            <FormItem><FormLabel>{match.away_team} Scorers (e.g. 9)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        
        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-4" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving & Recalculating...' : 'Save Result & Recalculate Scores'}
        </Button>
      </form>
    </Form>
  )
}
