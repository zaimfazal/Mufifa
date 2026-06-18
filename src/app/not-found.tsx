/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import Link from 'next/link'
import { Trophy } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mb-8 border border-destructive/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <span className="text-6xl font-black text-destructive">!</span>
      </div>
      
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-foreground mb-4">
        404 - Page Not Found
      </h1>
      
      <p className="text-xl text-muted-foreground mb-8">
        The ball went out of bounds. This page doesn't exist.
      </p>
      
      <Link 
        href="/"
        className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-8 text-sm font-medium text-accent-foreground shadow transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring neon-border-green"
      >
        <Trophy className="mr-2 h-4 w-4" /> Return to Pitch
      </Link>
    </div>
  )
}

