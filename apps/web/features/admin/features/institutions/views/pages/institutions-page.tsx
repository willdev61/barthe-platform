'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Building2, Plus, Power, PowerOff, Trash2, Loader2 } from 'lucide-react'
import type { AdminInstitution } from '@/features/admin/types'
import { getAdminInstitutions, updateInstitutionStatut, deleteAdminInstitution } from '../../services/admin-institution-service'
import { CreateInstitutionDialog } from '../components/create-institution-dialog'
import { formatDate } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUT_STYLES: Record<string, string> = {
  actif:    'bg-score-favorable-bg text-score-favorable',
  trial:    'bg-blue-50 text-blue-600',
  suspendu: 'bg-score-defavorable-bg text-score-defavorable',
}

export function InstitutionsPage() {
  const { data, isLoading, mutate } = useSWR<AdminInstitution[]>('admin-institutions', getAdminInstitutions)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const handleStatut = async (id: string, current: string) => {
    const next = current === 'actif' ? 'suspendu' : 'actif'
    setPendingId(id)
    try {
      await updateInstitutionStatut(id, next as 'actif' | 'suspendu')
      mutate((prev) => prev?.map((inst) => inst.id === id ? { ...inst, abonnement_statut: next } : inst))
    } finally {
      setPendingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setPendingId(id)
    try {
      await deleteAdminInstitution(id)
      mutate((prev) => prev?.filter((inst) => inst.id !== id))
    } finally {
      setPendingId(null)
      setDeleteConfirm(null)
    }
  }

  return (
    <>
    {showCreate && (
      <CreateInstitutionDialog
        onClose={() => setShowCreate(false)}
        onCreated={(institution) => {
          mutate((prev) => [institution, ...(prev ?? [])])
          setShowCreate(false)
        }}
      />
    )}
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Institutions</h1>
          <p className="text-muted-foreground mt-1 text-sm">{data ? `${data.length} institutions` : '…'}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" /> Créer institution
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Institution</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Email admin</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Pays</th>
                  <th className="text-center px-5 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Dossiers</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Créée le</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {data?.map((inst) => (
                  <tr key={inst.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{inst.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{inst.email_admin}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{inst.pays}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={cn('inline-block text-xs font-medium px-2 py-0.5 rounded-full', STATUT_STYLES[inst.abonnement_statut] ?? 'bg-muted text-muted-foreground')}>
                        {inst.abonnement_statut}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-foreground">{inst.nb_dossiers}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDate(inst.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {deleteConfirm === inst.id ? (
                          <>
                            <button onClick={() => handleDelete(inst.id)} disabled={pendingId === inst.id} className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity">
                              {pendingId === inst.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirmer'}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent transition-colors">Annuler</button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStatut(inst.id, inst.abonnement_statut)}
                              disabled={pendingId === inst.id || inst.abonnement_statut === 'trial'}
                              title={inst.abonnement_statut === 'actif' ? 'Suspendre' : 'Activer'}
                              className={cn('p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed', inst.abonnement_statut === 'actif' ? 'text-score-reserve hover:bg-score-reserve/10' : 'text-score-favorable hover:bg-score-favorable/10')}
                            >
                              {pendingId === inst.id ? <Loader2 className="w-4 h-4 animate-spin" /> : inst.abonnement_statut === 'actif' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setDeleteConfirm(inst.id)} title="Supprimer" className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
