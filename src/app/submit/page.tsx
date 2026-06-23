import { getMySubmission } from '@/actions/submission'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubmissionClient } from './submission-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Submit Predictions | µFifa '26",
  description: "Upload your machine learning predictions for the FIFA World Cup 2026",
}

export default async function SubmitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = await getMySubmission()

  if (data?.team?.submission_locked) {
    redirect('/dashboard')
  }

  const { data: settings } = await supabase
    .from('competition_settings')
    .select('tier1_only_mode')
    .single()
  const limited = settings?.tier1_only_mode === true

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
          Submission Portal
        </h1>
        <p className="text-muted-foreground mb-4">
          Upload your ML predictions for all knockout stage matches.
        </p>
        
        {data?.team && (
          <div className="p-4 rounded-md bg-card/50 border border-border inline-block shadow-sm">
            <p className="text-sm text-muted-foreground">Submitting as:</p>
            <p className="font-bold text-foreground text-lg">{data.team.team_name}</p>
            {user.user_metadata?.mulearn_id && (
              <p className="text-xs text-muted-foreground mt-1">MuLearn ID: {user.user_metadata.mulearn_id}</p>
            )}
          </div>
        )}
      </div>
      
      <SubmissionClient initialData={data} limited={limited} />
    </div>
  )
}
