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

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
          Submission Portal
        </h1>
        <p className="text-muted-foreground">
          Upload your ML predictions for all knockout stage matches.
        </p>
      </div>
      
      <SubmissionClient initialData={data} />
    </div>
  )
}
