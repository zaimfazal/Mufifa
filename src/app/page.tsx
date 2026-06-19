/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trophy, FileSpreadsheet, BrainCircuit, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Home(props: { searchParams?: SearchParams }) {
  const searchParams = props.searchParams ? await props.searchParams : undefined
  if (searchParams?.code && typeof searchParams.code === 'string') {
    redirect(`/auth/callback?code=${searchParams.code}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-20 lg:py-32 max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground shadow-sm">
            <Trophy className="mr-2 h-4 w-4 text-primary" /> The Official 2026 Challenge
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-foreground">
            µFifa '26 Machine Learning <br/>
            <span className="text-primary">Prediction Challenge</span>
          </h1>
          
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            Welcome to the ultimate test of predictive modeling. Build your machine learning algorithms, forecast the outcomes of all 104 matches of the FIFA World Cup 2026, and compete on the global leaderboard for predictive supremacy.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  Go to Dashboard <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                    Register Your Team
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                    View Leaderboard
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* About The Competition */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">About the Competition</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The FIFA World Cup 2026 is the largest in history, expanding to 48 teams and 104 matches. Your task is to accurately predict the entire tournament.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">1. Data Collection & Training</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    Participants are encouraged to gather historical FIFA match data, player statistics, Elo ratings, and environmental factors to train robust Machine Learning models.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">2. Generate Predictions</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    Run your models to generate predictions for all 104 matches. You must predict the exact scoreline, match outcome, expected goals (xG), ball possession, and goal scorers.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">3. Standardized Submission</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    Download our official CSV template. Map your model's outputs to our standardized schema and upload the final CSV via your dashboard before the tournament begins.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">4. Live Evaluation</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    As real-world matches conclude, the Admin panel will log the official results. The scoring engine will instantly evaluate your predictions and update your ranking on the Global Leaderboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring Rules Section */}
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Comprehensive Scoring System</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our automated engine awards points based on precision. Knockout stage matches automatically receive an increasing points multiplier.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">1. Match Outcome</h3>
              <p className="text-sm text-muted-foreground">
                Correctly predicting the winner or a draw yields the baseline points. This is the foundation of your score.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">2. Exact Scoreline</h3>
              <p className="text-sm text-muted-foreground">
                Bonus points are awarded for predicting the exact number of goals scored by both the home and away teams.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">3. Goal Scorers</h3>
              <p className="text-sm text-muted-foreground">
                Correctly naming players who score in the match grants significant bonus points per accurate player prediction.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">4. Match Stats</h3>
              <p className="text-sm text-muted-foreground">
                Predicting possession within a 5% margin and Expected Goals (xG) within 0.5 awards deep-analytics points.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

