/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useTransition } from 'react'
import { CsvUpload } from '@/components/submission/csv-upload'
import { ValidationResults } from '@/components/submission/validation-results'
import { SubmissionStatus } from '@/components/submission/submission-status'
import { uploadSubmission, downloadTemplate, createTeam } from '@/actions/submission'
import { ValidationResult } from '@/types/predictions'
import { Button } from '@/components/ui/button'
import { Download, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SubmissionClient({ initialData }: { initialData: any }) {
  const [file, setFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setValidationResult(null) // Reset validation when new file selected
  }

  const handleValidateAndSubmit = () => {
    if (!file) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append('file', file)
      
      const result = await uploadSubmission(formData)
      
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.validationResult) {
        setValidationResult(result.validationResult)
        if (!result.validationResult.valid) {
          toast.error("Validation failed. Please fix the errors and try again.")
        }
      } else if (result?.success) {
        toast.success("Predictions submitted successfully! You can update them any time before the deadline.")
        // Refresh page to get updated server state
        window.location.reload()
      }
    })
  }

  const handleDownloadTemplate = async () => {
    setIsDownloading(true)
    try {
      const csvContent = await downloadTemplate()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'mufifa26_template.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      toast.error('Failed to download template')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCreateTeam = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createTeam(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Team created successfully!")
        window.location.reload()
      }
    })
  }

  // 1. User has no team
  if (!initialData?.team) {
    return (
      <Card className="glass-panel border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Users className="w-6 h-6" />
            Create Your Team
          </CardTitle>
          <CardDescription>
            You need to create a nickname before submitting your predictions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreateTeam} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label htmlFor="team_name">Nickname</Label>
              <Input id="team_name" name="team_name" placeholder="e.g. The Data Wizards" required minLength={3} className="bg-background/50" />
            </div>
            <Button type="submit" disabled={isPending} className="bg-accent text-accent-foreground hover:bg-accent/90 neon-border-green">
              {isPending ? 'Creating...' : 'Create Team'}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  const isLocked = initialData.team.submission_locked
  const hasSubmitted = (initialData.predictionCount ?? 0) > 0

  return (
    <div className="space-y-6">
      <SubmissionStatus
        isLocked={isLocked}
        lockedAt={initialData.submission?.locked_at}
        predictionCount={initialData.predictionCount}
        hasSubmitted={hasSubmitted}
      />

      {!isLocked && (
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Upload Predictions</CardTitle>
              <CardDescription>Upload your completed CSV template here.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                asChild
                className="border-muted text-muted-foreground hover:bg-muted"
              >
                <a href="/Validation_Guide.pdf" target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Validation Guide
                </a>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownloadTemplate} 
                disabled={isDownloading}
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Get Template'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            
            <CsvUpload onFileSelect={handleFileSelect} isUploading={isPending} />
            
            {validationResult && (
              <ValidationResults 
                errors={validationResult.errors} 
                isValid={validationResult.valid} 
                isChecking={isPending} 
              />
            )}

            {file && (!validationResult || validationResult.valid) && (
              <div className="flex justify-end pt-4">
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        disabled={isPending}
                      />
                    }
                  >
                    {isPending ? 'Processing...' : 'Validate & Submit'}
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-panel border-accent/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Submit your predictions?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will validate your file and save it as your current submission.
                        <strong> You can re-upload to update it any time before the deadline.</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleValidateAndSubmit}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        Yes, Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

