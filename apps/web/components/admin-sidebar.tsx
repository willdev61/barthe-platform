'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Users,
  Activity,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Institutions', href: '/admin/institutions', icon: Building2 },
  { label: 'Utilisateurs', href: '/admin/users', icon: Users },
  { label: 'Monitoring', href: '/admin/monitoring', icon: Activity },
]

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-card border-r border-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive">
          <ShieldCheck className="w-5 h-5 text-destructive-foreground" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-foreground">BARTHE</span>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5 font-medium uppercase tracking-wider">
            Back Office
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-destructive text-destructive-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  isActive
                    ? 'text-destructive-foreground'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-destructive-foreground/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Back to app */}
      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          Retour au dashboard
        </Link>
      </div>
    </aside>
  )
}
