import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Trophy, LayoutDashboard, UploadCloud, ShieldAlert, LogOut, Menu, BookOpen } from 'lucide-react'
import { signOut } from '@/actions/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false
  let isLocked = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isAdmin = profile?.role === 'admin'
    const { data: team } = await supabase.from('teams').select('submission_locked').eq('owner_id', user.id).single()
    isLocked = team?.submission_locked || false
  }

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center neon-box-green">
            <span className="font-bold text-background">µ</span>
          </div>
          <span className="font-extrabold tracking-tight text-xl text-foreground">Fifa &apos;26</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors flex items-center">
            <Trophy className="w-4 h-4 mr-1" /> Leaderboard
          </Link>
          <Link href="/guide" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors flex items-center">
            <BookOpen className="w-4 h-4 mr-1" /> Guide
          </Link>
          {user && (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors flex items-center">
                <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
              </Link>
              {!isLocked && (
                <Link href="/submit" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors flex items-center">
                  <UploadCloud className="w-4 h-4 mr-1" /> Submit
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-1" /> Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-4">
              <Link href="/" className="flex items-center space-x-2 mb-8">
                <div className="w-8 h-8 rounded bg-accent flex items-center justify-center neon-box-green">
                  <span className="font-bold text-background">µ</span>
                </div>
                <span className="font-extrabold tracking-tight text-xl text-foreground">Fifa &apos;26</span>
              </Link>
              
              <Link href="/leaderboard" className="text-sm font-medium text-foreground hover:text-accent transition-colors flex items-center">
                <Trophy className="w-4 h-4 mr-2" /> Leaderboard
              </Link>
              
              <Link href="/guide" className="text-sm font-medium text-foreground hover:text-accent transition-colors flex items-center">
                <BookOpen className="w-4 h-4 mr-2" /> Guide
              </Link>
              
              {user && (
                <>
                  <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-accent transition-colors flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </Link>
                  {!isLocked && (
                    <Link href="/submit" className="text-sm font-medium text-foreground hover:text-accent transition-colors flex items-center">
                      <UploadCloud className="w-4 h-4 mr-2" /> Submit
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors flex items-center">
                      <ShieldAlert className="w-4 h-4 mr-2" /> Admin
                    </Link>
                  )}
                  <form action={signOut} className="mt-auto">
                    <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </form>
                </>
              )}
              
              {!user && (
                <div className="flex flex-col gap-2 mt-auto">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
