import { getCompetitionSettings, updateCompetitionSettings } from '@/actions/admin/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Global Settings | Admin | µFifa '26"
}

export default async function SettingsPage() {
  const settings = await getCompetitionSettings()

  // Format date for datetime-local input
  let formattedDeadline = ''
  if (settings.submission_deadline) {
    const d = new Date(settings.submission_deadline)
    // datetime-local expects YYYY-MM-DDThh:mm format
    formattedDeadline = d.toISOString().slice(0, 16)
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Competition Settings</h1>
        <p className="text-muted-foreground">Manage tournament deadlines and registration states.</p>
      </div>

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
                defaultValue={formattedDeadline}
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
                defaultChecked={settings.registrations_open}
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
    </div>
  )
}
