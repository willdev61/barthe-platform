'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Menu, LogOut, Settings } from 'lucide-react'
import { useSession, signOut } from '@/lib/auth-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/import': 'Importer un BP',
  '/dossiers': 'Dossiers',
  '/comparatif': 'Comparatif',
  '/historique': 'Historique',
  '/settings': 'Paramètres',
}

function getTitle(pathname: string): string {
  for (const [route, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === route || pathname.startsWith(route + '/')) return title
  }
  return 'BARTHE'
}

interface AppToolbarProps {
  onMenuToggle: () => void
}

export function AppToolbar({ onMenuToggle }: AppToolbarProps) {
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
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4 shrink-0">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-base font-semibold text-foreground flex-1 truncate">{title}</h1>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors shrink-0"
            aria-label="Menu utilisateur"
          >
            <span className="text-xs font-semibold text-primary">{initials}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email ?? ''}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Paramètres
            </Link>
          </DropdownMenuItem>
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
    </header>
  )
}
