'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  LogOut,
  BarChart3,
  ChevronRight,
  Building2,
  History,
  Settings,
  GitCompareArrows,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut, useSession, organization } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

const navItems = [
  {
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Importer un BP',
    href: '/import',
    icon: Upload,
  },
  {
    label: 'Dossiers',
    href: '/dossiers',
    icon: FolderOpen,
  },
  {
    label: 'Comparatif',
    href: '/comparatif',
    icon: GitCompareArrows,
  },
  {
    label: 'Historique',
    href: '/historique',
    icon: History,
  },
  {
    label: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { data: activeOrg } = useSWR('active-org', () => organization.getFullOrganization())

  const userName = session?.user?.name ?? '…'
  const orgName = activeOrg?.data?.name ?? '…'
  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const handleNavClick = () => {
    onClose?.()
  }

  return (
    <aside className="flex flex-col w-64 h-full bg-card border-r border-border shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
          <BarChart3 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            BARTHE
          </span>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
            Analyse Business Plans
          </p>
        </div>
      </div>

      {/* Institution */}
      <div className="px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {orgName}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-primary-foreground/60" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-md">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
            <span className="text-xs font-semibold text-primary">
              {initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {session?.user?.email ?? ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
