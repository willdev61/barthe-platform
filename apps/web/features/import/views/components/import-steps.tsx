import { CheckCircle2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Fichier & Projet' },
  { id: 2, label: 'Analyse en cours' },
  { id: 3, label: 'Résultat' },
]

interface ImportStepsProps {
  currentStep: number
}

export function ImportSteps({ currentStep }: ImportStepsProps) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, idx) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors',
                currentStep > s.id
                  ? 'bg-score-favorable text-white'
                  : currentStep === s.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {currentStep > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
            </div>
            <span
              className={cn(
                'text-sm font-medium hidden sm:block',
                currentStep === s.id ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {s.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  )
}
