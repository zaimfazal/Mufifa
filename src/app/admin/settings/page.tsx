import { getCompetitionSettings } from '@/actions/admin/settings'
import { SettingsForm } from '@/components/admin/settings-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Global Settings | Admin | µFifa '26"
}

export default async function SettingsPage() {
  const settings = await getCompetitionSettings()

  // Format date for datetime-local input (expects YYYY-MM-DDThh:mm)
  let formattedDeadline = ''
  if (settings.submission_deadline) {
    formattedDeadline = settings.submission_deadline
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Competition Settings</h1>
        <p className="text-muted-foreground">Manage tournament deadlines and registration states.</p>
      </div>

      <SettingsForm
        initialDeadline={formattedDeadline}
        initialSubmissionsOpen={settings.submissions_open ?? true}
        initialTier1Only={settings.tier1_only_mode ?? false}
      />
    </div>
  )
}
