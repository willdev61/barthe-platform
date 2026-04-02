import { cn } from '@/lib/utils'

interface SectionProps {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Section({ icon: Icon, title, description, action, children, className }: SectionProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-6', className)}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
