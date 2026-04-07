'use client'

import { usePathname } from 'next/navigation'
import { Menu, Bell } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/import': 'Importer un BP',
  '/dossiers': 'Dossiers',
  '/comparatif': 'Comparatif',
  '/historique': 'Historique',
  '/settings': 'Paramètres',
  '/settings/equipe': 'Équipe',
  '/settings/api-keys': 'Clés API',
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
  const title = getTitle(pathname)

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-border bg-white px-6 shrink-0">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-base font-semibold text-foreground flex-1 truncate">{title}</h1>

      <button
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
      </button>
    </header>
  )
}
