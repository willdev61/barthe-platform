'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  LogOut,
  BarChart3,
  ChevronRight,
  Building2,
  History,
  Settings,
  GitCompareArrows,
  Key,
  ChevronsUpDown,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut, useSession, organization } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'


const navItems = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Dossiers', href: '/dossiers', icon: FolderOpen },
  { label: 'Comparatif', href: '/comparatif', icon: GitCompareArrows },
  { label: 'Historique', href: '/historique', icon: History },
]

const devItems = [
  { label: 'Clés API', href: '/settings/api-keys', icon: Key },
]

interface SidebarProps {
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  onOpenProfile?: () => void
}

export function Sidebar({ onClose, collapsed = false, onToggleCollapse, onOpenProfile }: SidebarProps) {
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
    <aside
        className={cn(
          'flex flex-col h-full bg-card border-r border-border shrink-0 overflow-y-auto',
          'transition-all duration-200 ease-in-out',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo + toggle */}
        <div
          className={cn(
            'flex items-center gap-3 border-b border-border shrink-0',
            collapsed ? 'px-3 py-5 justify-center' : 'px-6 py-5'
          )}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary shrink-0">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className="text-lg font-bold tracking-tight text-foreground">BARTHE</span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Analyse Business Plans</p>
            </div>
          )}
          {/* Toggle button — desktop only */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                aria-label={collapsed ? 'Développer la sidebar' : 'Réduire la sidebar'}
              >
                {collapsed
                  ? <PanelLeftOpen className="w-4 h-4" />
                  : <PanelLeftClose className="w-4 h-4" />
                }
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {collapsed ? 'Développer' : 'Réduire'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Institution */}
        {!collapsed && (
          <div className="px-6 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{orgName}</span>
            </div>
          </div>
        )}

        {/* Navigation principale */}
        <nav className={cn('flex-1 py-4 space-y-0.5', collapsed ? 'px-2' : 'px-3')}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon

            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center rounded-md text-sm font-medium transition-colors group',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary-foreground/60" />}
                  </>
                )}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>{item.label}</TooltipContent>
                </Tooltip>
              )
            }
            return link
          })}

          {/* Groupe Développeurs */}
          <div className="pt-4">
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Développeurs
              </p>
            )}
            {collapsed && <div className="my-2 border-t border-border" />}
            {devItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon

              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center rounded-md text-sm font-medium transition-colors group',
                    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary-foreground/60" />}
                    </>
                  )}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>{item.label}</TooltipContent>
                  </Tooltip>
                )
              }
              return link
            })}
          </div>
        </nav>

        {/* User dropdown */}
        <div className={cn('border-t border-border', collapsed ? 'px-2 py-3' : 'px-3 py-4')}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center justify-center w-full p-2.5 rounded-md hover:bg-accent transition-colors"
                  onClick={() => onOpenProfile?.()}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                    <span className="text-xs font-semibold text-primary">{initials}</span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>{userName}</TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md hover:bg-accent transition-colors text-left">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                    <span className="text-xs font-semibold text-primary">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{session?.user?.email ?? ''}</p>
                  </div>
                  <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
                <DropdownMenuItem onClick={() => onOpenProfile?.()} className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>
  )
}
