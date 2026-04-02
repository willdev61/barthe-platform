import { z } from 'zod'

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 Mo
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
]

export const importFormSchema = z.object({
  nom_projet: z.string().min(2, 'Nom du projet requis (min. 2 caractères)'),
})

export type ImportFormData = z.infer<typeof importFormSchema>

export function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Format non supporté. Acceptés : PDF, Excel (.xlsx, .xls), CSV'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'Fichier trop volumineux (max 10 Mo)'
  }
  return null
}
