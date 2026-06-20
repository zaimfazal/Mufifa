import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className="hidden md:block w-64 border-r border-border/50 bg-card/30 backdrop-blur-sm">
        <AdminSidebar />
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:hidden border-b border-border/50 overflow-x-auto">
          <nav className="flex items-center gap-2 min-w-max">
            {[
              { name: 'Overview', href: '/admin' },
              { name: 'Matches', href: '/admin/matches' },
              { name: 'Results', href: '/admin/results' },
              { name: 'Scoring', href: '/admin/scoring' },
              { name: 'Users', href: '/admin/users' },
              { name: 'Settings', href: '/admin/settings' },
              { name: 'Logs', href: '/admin/logs' },
            ].map((item) => (
              <a key={item.href} href={item.href} className="text-xs font-semibold text-muted-foreground hover:text-accent px-3 py-1.5 rounded-full border border-border/50 whitespace-nowrap transition-colors">
                {item.name}
              </a>
            ))}
          </nav>
        </div>
        {children}
      </main>
    </div>
  )
}
