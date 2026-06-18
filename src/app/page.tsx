/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trophy, UploadCloud, BrainCircuit, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-20 lg:py-32 overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
          <div className="w-[800px] h-[800px] bg-accent/20 rounded-full blur-[100px] animate-[pulse-neon_4s_ease-in-out_infinite]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-[slide-up_0.8s_ease-out]">
          <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent backdrop-blur-sm">
            <Trophy className="mr-2 h-4 w-4" /> The Ultimate Prediction Challenge
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Predict the Future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary animate-pulse">
              Football with AI
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Join the µFifa '26 Challenge. Build your machine learning model, submit your predictions for all 104 matches, and compete on the global leaderboard.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 neon-border-green px-8">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 neon-border-green px-8">
                    Start Predicting
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-border/50 bg-background/50 backdrop-blur hover:bg-muted/50 px-8">
                    View Leaderboard
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card/30 border-t border-border/50 backdrop-blur-md py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl border-border/50 hover:border-accent/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6 neon-box-green">
                <BrainCircuit className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Build Your Model</h3>
              <p className="text-muted-foreground leading-relaxed">
                Train your ML models using historical FIFA data. Predict match outcomes, exact scorelines, goal scorers, and advanced match statistics.
              </p>
            </div>
            
            <div className="glass-panel p-8 rounded-2xl border-border/50 hover:border-secondary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <UploadCloud className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lock Submissions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Download our standardized CSV template, format your predictions, and upload them through our secure, automated validation pipeline before kickoff.
              </p>
            </div>
            
            <div className="glass-panel p-8 rounded-2xl border-border/50 hover:border-orange-500/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <BarChart3 className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Climb the Ranks</h3>
              <p className="text-muted-foreground leading-relaxed">
                As real-world matches conclude, our engine automatically scores your predictions based on a complex weighting system. Watch your rank update live.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

