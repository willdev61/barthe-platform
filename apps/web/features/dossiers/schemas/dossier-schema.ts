import { z } from 'zod'

export const createDossierSchema = z.object({
  nom_projet: z.string().min(2, 'Le nom du projet doit contenir au moins 2 caractères'),
  fichier_nom: z.string().min(1, 'Le nom du fichier est requis'),
})

export type CreateDossierInput = z.infer<typeof createDossierSchema>
