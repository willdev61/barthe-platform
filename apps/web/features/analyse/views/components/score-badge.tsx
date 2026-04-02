import { cn } from '@/lib/utils'
import { getScoreLabel, getScoreBgColor } from '@/lib/types'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  className?: string
}

export function ScoreBadge({ score, size = 'md', showLabel = false, className }: ScoreBadgeProps) {
  const label = getScoreLabel(score)
  const colorClass = getScoreBgColor(score)

  const sizeConfig = {
    sm: { circle: 'w-10 h-10', text: 'text-sm font-bold', label: 'text-xs' },
    md: { circle: 'w-14 h-14', text: 'text-base font-bold', label: 'text-xs' },
    lg: { circle: 'w-20 h-20', text: 'text-xl font-bold', label: 'text-sm' },
    xl: { circle: 'w-32 h-32', text: 'text-3xl font-bold', label: 'text-base' },
  }

  const config = sizeConfig[size]

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn('rounded-full flex items-center justify-center border-2 border-current/20', config.circle, colorClass)}
        role="img"
        aria-label={`Score: ${score}/100 — ${label}`}
      >
        <span className={config.text}>{score}</span>
      </div>
      {showLabel && (
        <span className={cn('font-semibold', config.label, colorClass.split(' ')[1])}>
          {label}
        </span>
      )}
    </div>
  )
}

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ScoreRing({ score, size = 140, strokeWidth = 10, className }: ScoreRingProps) {
  const label = getScoreLabel(score)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const colorMap: Record<string, string> = {
    Favorable: '#3B6D11',
    Réservé: '#854F0B',
    Défavorable: '#A32D2D',
  }
  const textColorMap: Record<string, string> = {
    Favorable: 'text-score-favorable',
    Réservé: 'text-score-reserve',
    Défavorable: 'text-score-defavorable',
  }

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score de finançabilité: ${score}/100 — ${label}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-border" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={colorMap[label]} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold leading-none', textColorMap[label], size >= 120 ? 'text-4xl' : 'text-2xl')}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground mt-1 leading-none">/ 100</span>
      </div>
    </div>
  )
}
