import { cn } from '@/lib/utils'
import { formatCurrency, getScoreBgColor } from '@/lib/types'
import type { ComparatifItem } from '../../types'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

interface ComparatifTableProps {
  comparatif: ComparatifItem[]
  loading: boolean
}

export function ComparatifTable({ comparatif, loading }: ComparatifTableProps) {
  const maxScore = Math.max(...comparatif.map((c) => c.score ?? -1))

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Tableau comparatif</h2>
      </div>

      {loading ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Projet</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Secteur</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">CA</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">EBITDA</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Dette</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Score</th>
              </tr>
            </thead>
            <tbody>
              {comparatif.map((item, i) => {
                const isBest = item.score !== null && item.score === maxScore
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      'border-b border-border last:border-0',
                      isBest ? 'bg-score-favorable-bg' : 'hover:bg-muted/20'
                    )}
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                        <span className="truncate max-w-[200px]">{item.nom_projet}</span>
                        {isBest && (
                          <span className="text-[10px] font-semibold text-score-favorable border border-score-favorable/30 rounded-full px-1.5 py-0.5 shrink-0">
                            Meilleur
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{item.secteur ?? '—'}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrency(item.ca)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrency(item.ebitda)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrency(item.dette)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {item.score !== null ? (
                        <span className={cn('inline-block text-xs font-semibold px-2 py-0.5 rounded-full', getScoreBgColor(item.score))}>
                          {item.score}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
