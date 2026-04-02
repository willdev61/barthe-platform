import type { MonitoringData } from '@/features/admin/types'

export async function getAdminMonitoring(): Promise<MonitoringData> {
  const res = await fetch('/api/admin/monitoring')
  if (!res.ok) throw new Error('Erreur chargement monitoring')
  return res.json()
}
