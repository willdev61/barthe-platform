'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Menu, ShieldCheck, LogOut } from 'lucide-react'
import { useSession, signOut } from '@/lib/auth-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Administration',
  '/admin/institutions': 'Institutions',
  '/admin/users': 'Utilisateurs',
  '/admin/monitoring': 'Monitoring',
}

function getTitle(pathname: string): string {
  for (const [route, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === route || pathname.startsWith(route + '/')) return title
  }
  return 'Administration'
}

interface AdminToolbarProps {
  onMenuToggle: () => void
}

export function AdminToolbar({ onMenuToggle }: AdminToolbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const title = getTitle(pathname)
  const userName = session?.user?.name ?? session?.user?.email ?? '…'
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex py-5 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4 shrink-0">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-base font-semibold text-foreground flex-1 truncate">{title}</h1>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors shrink-0"
              aria-label="Menu admin"
            >
              <span className="text-xs font-semibold text-destructive">{initials}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email ?? ''}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
