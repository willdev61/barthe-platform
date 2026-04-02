import { Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const ANALYSE_STEPS = [
  'Lecture du fichier Excel…',
  'Extraction des données…',
  'Normalisation via LLM…',
  'Calcul des ratios financiers…',
  'Scoring de finançabilité…',
  'Génération de la synthèse…',
]

interface AnalyseProgressProps {
  stepIndex: number
  progress: number
}

export function AnalyseProgress({ stepIndex, progress }: AnalyseProgressProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-8 space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-5">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Analyse en cours…</h2>
        <p className="text-sm text-muted-foreground mt-1">Notre IA analyse votre Business Plan</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progression</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        {ANALYSE_STEPS.map((label, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-3 text-sm transition-colors',
              i < stepIndex
                ? 'text-score-favorable'
                : i === stepIndex
                ? 'text-primary font-medium'
                : 'text-muted-foreground'
            )}
          >
            <div
              className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0',
                i < stepIndex
                  ? 'bg-score-favorable'
                  : i === stepIndex
                  ? 'bg-primary animate-pulse'
                  : 'bg-muted-foreground/30'
              )}
            />
            {label}
            {i < stepIndex && <CheckCircle2 className="w-3.5 h-3.5 text-score-favorable ml-auto" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export const ANALYSE_STEPS_DURATIONS = [800, 700, 1200, 600, 400, 700]
