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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createMatch, updateMatch } from '@/actions/admin/matches'
import { toast } from 'sonner'
import { TOURNAMENT_STAGES } from '@/lib/constants'

const matchSchema = z.object({
  match_code: z.string().min(1, 'Required'),
  stage: z.string(),
  home_team: z.string().min(1, 'Required'),
  away_team: z.string().min(1, 'Required'),
  kickoff_time: z.string(),
  multiplier: z.coerce.number().min(1),
  status: z.string()
})

export function MatchForm({ mode, match }: { mode: 'create' | 'edit', match?: any }) {
  const [open, setOpen] = useState(false)

  const defaultTime = match?.kickoff_time ? new Date(match.kickoff_time).toISOString().slice(0, 16) : ''

  const form = useForm<z.infer<typeof matchSchema>>({
    resolver: zodResolver(matchSchema) as any,
    defaultValues: {
      match_code: match?.match_code || '',
      stage: match?.stage || 'round_of_32',
      home_team: match?.home_team || '',
      away_team: match?.away_team || '',
      kickoff_time: defaultTime,
      multiplier: match?.multiplier || 1.0,
      status: match?.status || 'scheduled'
    }
  })

  async function onSubmit(values: z.infer<typeof matchSchema>) {
    const formData = new FormData()
    Object.entries(values).forEach(([k, v]) => formData.append(k, String(v)))

    const res = mode === 'create' 
      ? await createMatch(formData)
      : await updateMatch(match.id, formData)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(mode === 'create' ? 'Match created' : 'Match updated')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          mode === 'create' ? (
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Add Match</Button>
          ) : (
            <Button variant="outline" size="sm">Edit</Button>
          )
        }
      />
      <DialogContent className="glass-panel sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Match' : 'Edit Match'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="match_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Code</FormLabel>
                    <FormControl><Input {...field} disabled={mode === 'edit'} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {TOURNAMENT_STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="home_team" render={({ field }) => (
                <FormItem><FormLabel>Home Team</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="away_team" render={({ field }) => (
                <FormItem><FormLabel>Away Team</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="kickoff_time" render={({ field }) => (
                <FormItem><FormLabel>Kickoff Time (Local)</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="multiplier" render={({ field }) => (
                <FormItem><FormLabel>Multiplier</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              {mode === 'edit' && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Match'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

