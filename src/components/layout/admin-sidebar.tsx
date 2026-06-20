'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  Settings2, 
  Users, 
  ScrollText 
} from 'lucide-react'

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Matches', href: '/admin/matches', icon: CalendarDays },
  { name: 'Enter Results', href: '/admin/results', icon: CheckSquare },
  { name: 'Scoring Rules', href: '/admin/scoring', icon: Settings2 },
  { name: 'Global Settings', href: '/admin/settings', icon: Settings2 },
  { name: 'Manage Users', href: '/admin/users', icon: Users },
  { name: 'Audit Logs', href: '/admin/logs', icon: ScrollText },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2 p-4">
      <div className="mb-8 px-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Admin Console</h2>
        <p className="text-xs text-muted-foreground">Manage the tournament</p>
      </div>
      
      {navItems.map((item) => {
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              isActive 
                ? "bg-accent/10 text-accent font-medium neon-border-green" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
