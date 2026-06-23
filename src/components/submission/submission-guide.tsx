'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

/**
 * Inline submission guideline. Mode-aware: the limited competition scores only
 * the exact scoreline and the set of scorer jersey numbers per team.
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
          <DialogDescription>
            {limited
              ? 'Each match is scored on two things only: the exact final score and which players scored.'
              : 'Fill one row per match with your predicted outcome and statistics.'}
          </DialogDescription>
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
        <h4 className="font-semibold text-foreground mb-1">One row per match</h4>
        <p className="text-muted-foreground">
          The template comes pre-filled with <code>match_id</code>, <code>home_team</code> and{' '}
          <code>away_team</code> for every knockout match. Do not change those — just fill the
          prediction columns on each row.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-foreground mb-1">1. Exact score</h4>
        <p className="text-muted-foreground">
          Put the home goals in <code>predicted_home_score</code> and away goals in{' '}
          <code>predicted_away_score</code>. You only earn the score points if{' '}
          <strong>both numbers are exactly right</strong> — there is no partial credit.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-foreground mb-1">2. Scorers (jersey numbers)</h4>
        <p className="text-muted-foreground">
          List the <strong>jersey numbers</strong> of the players you think will score, separated by
          semicolons. Home scorers go in <code>predicted_scorers_home</code>, away scorers in{' '}
          <code>predicted_scorers_away</code>. Use the number once per player even if you think they
          score twice — we only care <em>who</em> scores, not how many.
        </p>
      </section>

      <section>
        <h4 className="font-semibold text-foreground mb-1">The count must match the score</h4>
        <p className="text-muted-foreground">
          The number of scorer entries on each side must equal that side&apos;s predicted score. A{' '}
          <code>2 : 0</code> needs exactly 2 home numbers and 0 away numbers. A correctly predicted{' '}
          <code>0 : 0</code> (no scorers on either side) still earns the scorer points.
        </p>
      </section>

      <section className="rounded-md border border-border/50 bg-muted/20 p-3">
        <p className="font-semibold text-foreground mb-1">Example — Brazil 2 : 1 Spain</p>
        <p className="text-muted-foreground font-mono text-xs">
          predicted_home_score = 2<br />
          predicted_away_score = 1<br />
          predicted_scorers_home = 10;7<br />
          predicted_scorers_away = 9
        </p>
        <p className="text-muted-foreground mt-2">
          You get the score points only if it ends 2–1, and the scorer points only if exactly #10
          and #7 score for Brazil and exactly #9 scores for Spain.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        Scores in later rounds are worth more (a stage multiplier is applied automatically).
      </p>
    </div>
  )
}

function FullGuide() {
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>
        Fill one row per match with your predicted winner, exact score, goal scorers, and match
        statistics (possession, shots, xG, cards). Possession for the two teams must sum to 100.
      </p>
      <p>
        Enter your tournament champion once in the <code>tournament_champion</code> column (any row).
      </p>
    </div>
  )
}
