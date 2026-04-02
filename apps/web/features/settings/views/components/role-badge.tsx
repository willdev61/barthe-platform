import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  role: string
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        (role === 'admin' || role === 'owner') && 'bg-primary/10 text-primary',
        role === 'analyste' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        role === 'lecture' && 'bg-muted text-muted-foreground',
      )}
    >
      {role === 'owner' ? 'Propriétaire' : role === 'admin' ? 'Admin' : role === 'analyste' ? 'Analyste' : 'Lecture'}
    </span>
  )
}
