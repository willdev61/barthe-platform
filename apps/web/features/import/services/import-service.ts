export { runAnalyse } from '@/features/analyse/services/analyse-service'

export async function uploadDossierFile(dossierId: string, file: File): Promise<void> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`/api/dossiers/${dossierId}/fichier`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error("Erreur lors de l'envoi du fichier")
}
