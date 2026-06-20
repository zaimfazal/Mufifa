'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit2, X, Check } from 'lucide-react'
import { updateTeamName } from '@/actions/dashboard'
import { toast } from 'sonner'

export function EditTeamName({ initialName }: { initialName: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [isPending, startTransition] = useTransition()

  const handleSave = async () => {
    if (name.length < 3) {
      toast.error('Team name must be at least 3 characters')
      return
    }
    if (name === initialName) {
      setIsEditing(false)
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('team_name', name)
      
      const result = await updateTeamName(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Team name updated')
        setIsEditing(false)
      }
    })
  }

  if (isEditing) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="max-w-[250px] text-lg font-bold bg-background/50 h-10"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setIsEditing(false)
          }}
          disabled={isPending}
        />
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={handleSave} disabled={isPending} className="h-10 w-10 text-green-500 hover:text-green-600 hover:bg-green-500/10">
            <Check className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} disabled={isPending} className="h-10 w-10 text-muted-foreground hover:text-destructive">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 group">
      <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
        {name}
      </h1>
      <Button 
        size="icon" 
        variant="ghost" 
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground"
        onClick={() => setIsEditing(true)}
      >
        <Edit2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
