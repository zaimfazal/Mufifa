'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

/**
 * Inline submission guide for completing the knockout stage prediction template.
 */
export function SubmissionGuide({ limited }: { limited: boolean }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" className="border-muted text-muted-foreground hover:bg-muted" />
        }
      >
        <BookOpen className="w-4 h-4 mr-2" />
        How to fill the template
      </DialogTrigger>
      <DialogContent className="glass-panel border-accent/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle>How to fill your prediction template</DialogTitle>
        </DialogHeader>

        {limited ? <LimitedGuide /> : <FullGuide />}
      </DialogContent>
    </Dialog>
  )
}

function LimitedGuide() {
  return (
    <div className="space-y-4 text-sm">
      <section>
        <p className="text-muted-foreground">
          Complete the prediction template by filling in the knockout stage from the{' '}
          <strong>Round of 16</strong> through the <strong>Final</strong>.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-foreground mb-1">home_team</h4>
        <p className="text-muted-foreground">
          Enter the team you predict will play as the home team in that fixture.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-foreground mb-1">away_team</h4>
        <p className="text-muted-foreground">
          Enter the team you predict will play as the away team in that fixture.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-foreground mb-1">
          predicted_home_score & predicted_away_score
        </h4>
        <p className="text-muted-foreground">
          Enter the predicted final goals scored by the home and away teams at the end of regular time and extra time (if played). Do not include goals scored in a penalty shootout.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-foreground mb-1">
          predicted_scorers_home & predicted_scorers_away
        </h4>
        <p className="text-muted-foreground">
          Enter the jersey number(s) of the home and away teams' goal scorer(s). If multiple players score,
          separate the jersey numbers with a semicolon (<code>;</code>).
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <strong>Example:</strong> <code>9;11;7</code>
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-foreground mb-1">predicted_winner</h4>
        <p className="text-muted-foreground">
          Enter the team you predict will win the match. If the match is decided on penalties,
          enter the team that advances.
        </p>
      </section>

      <section className="rounded-md border border-border/50 bg-muted/20 p-3">
        <h4 className="font-semibold text-foreground mb-2">Notes</h4>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Leave the scorer columns empty if you predict 0 goals for that team.</li>
          <li>
            The number of predicted goal scorers must not exceed the predicted score for the
            corresponding team.
          </li>
        </ul>
      </section>
    </div>
  )
}


function FullGuide() {
  return <LimitedGuide />
}
