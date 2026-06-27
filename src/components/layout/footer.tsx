import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Built for the <span className="font-semibold text-foreground">µLearn Hackathon</span>
        </p>
        <div className="flex items-center space-x-6">
          <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-accent transition-colors">
            Leaderboard
          </Link>
        </div>
        <p className="text-sm text-muted-foreground hidden sm:block">
          &copy; {new Date().getFullYear()} µFifa &apos;26. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

