'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Users,
  Activity,
  ChevronRight,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems = [
  { label: 'Institutions', href: '/admin/institutions', icon: Building2 },
  { label: 'Utilisateurs', href: '/admin/users', icon: Users },
  { label: 'Monitoring', href: '/admin/monitoring', icon: Activity },
]

interface AdminSidebarProps {
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function AdminSidebar({ onClose, collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-card border-r border-border shrink-0 overflow-y-auto',
        'transition-all duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 border-b border-border shrink-0',
          collapsed ? 'px-3 py-5 justify-center' : 'px-6 py-5'
        )}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive shrink-0">
          <ShieldCheck className="w-5 h-5 text-destructive-foreground" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-lg font-bold tracking-tight text-foreground">BARTHE</span>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5 font-medium uppercase tracking-wider">
              Back Office
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 py-4 space-y-0.5', collapsed ? 'px-2' : 'px-3')}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center rounded-md text-sm font-medium transition-colors group',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
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
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-destructive-foreground/60" />}
                </>
              )}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return linkContent
        })}
      </nav>

      {/* Toggle button — desktop only */}
      <div className={cn('py-3 border-t border-border shrink-0', collapsed ? 'px-2' : 'px-3')}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex w-full items-center justify-center p-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Développer la sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Développer
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex w-full items-center justify-center p-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Réduire la sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Réduire
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  )
}
