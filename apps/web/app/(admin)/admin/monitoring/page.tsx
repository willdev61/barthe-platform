'use client'

import useSWR from 'swr'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Building2,
  FolderOpen,
  Zap,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import { getAdminMonitoring } from '@/lib/api'
import type { MonitoringData } from '@/lib/types'
import { formatDate, getScoreBgColor } from '@/lib/types'
import { cn } from '@/lib/utils'

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg', color)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

export default function MonitoringPage() {
  const { data, isLoading } = useSWR<MonitoringData>('admin-monitoring', getAdminMonitoring)

  const stats = data?.stats
  const chartData = data?.dossiers_par_jour ?? []
  // Show every 5th label to avoid crowding
  const tickFormatter = (value: string, index: number) =>
    index % 5 === 0 ? value : ''

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Monitoring</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Métriques globales de la plateforme
        </p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Institutions"
            value={stats.total_institutions}
            icon={Building2}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            label="Dossiers"
            value={stats.total_dossiers}
            icon={FolderOpen}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Tokens LLM"
            value={stats.total_tokens_llm.toLocaleString('fr-FR')}
            icon={Zap}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Score moyen"
            value={`${stats.score_moyen}/100`}
            icon={TrendingUp}
            color="bg-score-favorable-bg text-score-favorable"
          />
          <StatCard
            label="Coût estimé"
            value={`$${stats.tokens_cout_estime_usd.toFixed(2)}`}
            sub="Claude API (~$15/M tokens)"
            icon={DollarSign}
            color="bg-muted text-muted-foreground"
          />
        </div>
      ) : null}

      {/* Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-1">
          Dossiers créés par jour
        </h2>
        <p className="text-xs text-muted-foreground mb-5">30 derniers jours</p>

        {isLoading ? (
          <div className="h-56 bg-muted rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={14}>
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={tickFormatter}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                allowDecimals={false}
                width={24}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', radius: 4 }}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(v: number) => [v, 'Dossiers']}
              />
              <Bar
                dataKey="dossiers"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Latest analyses */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Dernières analyses</h2>
        </div>
        {isLoading ? (
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
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Institution</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Tokens</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.dernieres_analyses.map((a) => (
                  <tr
                    key={a.dossier_id}
                    className="border-b border-border last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">{a.nom_projet}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{a.institution}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">
                      {a.tokens.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={cn(
                          'inline-block text-xs font-semibold px-2 py-0.5 rounded-full',
                          getScoreBgColor(a.score)
                        )}
                      >
                        {a.score}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDate(a.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
