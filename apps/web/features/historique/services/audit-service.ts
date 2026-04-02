import type { AuditLog, AuditLogsResponse } from '../types'

export async function getAuditLogs(params?: {
  page?: number
  action?: string
  start_date?: string
  end_date?: string
}): Promise<AuditLogsResponse> {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.action) qs.set('action', params.action)
  if (params?.start_date) qs.set('start_date', params.start_date)
  if (params?.end_date) qs.set('end_date', params.end_date)
  const res = await fetch(`/api/audit?${qs}`)
  if (!res.ok) throw new Error("Erreur lors du chargement de l'historique")
  return res.json()
}

export async function getAuditLogsForDossier(dossierId: string): Promise<AuditLog[]> {
  const res = await fetch(`/api/audit/dossiers/${dossierId}`)
  if (!res.ok) throw new Error("Erreur lors du chargement de l'historique")
  return res.json()
}
