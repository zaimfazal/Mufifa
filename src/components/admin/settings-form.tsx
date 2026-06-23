'use client'

import { useState } from 'react'
import { updateCompetitionSettings } from '@/actions/admin/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface SettingsFormProps {
  initialDeadline: string
  initialRegistrationsOpen: boolean
  initialTier1Only: boolean
}

/**
 * Controlled settings form. Base UI warns when an uncontrolled field's default
 * appears to change after mount, so every field here is controlled via state.
 * Controlled inputs still submit through the server action via their `name`.
 */
export function SettingsForm({ initialDeadline, initialRegistrationsOpen, initialTier1Only }: SettingsFormProps) {
  const [deadline, setDeadline] = useState(initialDeadline)
  const [registrationsOpen, setRegistrationsOpen] = useState(initialRegistrationsOpen)
  const [tier1Only, setTier1Only] = useState(initialTier1Only)

  return (
    <form action={updateCompetitionSettings} className="space-y-8 max-w-2xl">
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle>Deadline Enforcement</CardTitle>
          <CardDescription>
            Set the exact timestamp when submissions are globally locked.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Submission Deadline</label>
            <Input
              type="datetime-local"
              name="submission_deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep submissions open indefinitely.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Registrations Open</label>
              <p className="text-xs text-muted-foreground">Toggle whether new users can register.</p>
            </div>
            <Switch
              name="registrations_open"
              checked={registrationsOpen}
              onCheckedChange={setRegistrationsOpen}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Limited Scoring Mode</label>
              <p className="text-xs text-muted-foreground">
                When on, each match scores only two things: the exact scoreline and the exact set of
                scorer jersey numbers (per team). Everything else scores 0. Toggling this recalculates the leaderboard.
              </p>
            </div>
            <Switch
              name="tier1_only_mode"
              checked={tier1Only}
              onCheckedChange={setTier1Only}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Save Settings
            </Button>
          </div>

        </CardContent>
      </Card>
    </form>
  )
}
