'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Dossier, Analyse } from '@/lib/types'
import { createDossier } from '@/features/dossiers/services/dossier-service'
import { uploadDossierFile, runAnalyse } from '../../services/import-service'
import type { ImportFormData } from '../../schemas/import-schema'
import { ImportSteps } from '../components/import-steps'
import { ImportForm } from '../forms/import-form'
import { AnalyseProgress, ANALYSE_STEPS_DURATIONS } from '../components/analyse-progress'
import { AnalyseResult } from '../components/analyse-result'

export function ImportPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analyseStepIndex, setAnalyseStepIndex] = useState(0)
  const [analyseProgress, setAnalyseProgress] = useState(0)
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [analyse, setAnalyse] = useState<Analyse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const runProgressAnimation = async () => {
    const total = ANALYSE_STEPS_DURATIONS.reduce((s, d) => s + d, 0)
    let elapsed = 0
    for (let i = 0; i < ANALYSE_STEPS_DURATIONS.length; i++) {
      setAnalyseStepIndex(i)
      await new Promise((r) => setTimeout(r, ANALYSE_STEPS_DURATIONS[i]))
      elapsed += ANALYSE_STEPS_DURATIONS[i]
      setAnalyseProgress(Math.round((elapsed / total) * 90))
    }
  }

  const handleSubmit = async (data: ImportFormData) => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const newDossier = await createDossier({
        nom_projet: data.nom_projet,
        fichier_nom: selectedFile.name,
      })
      setDossier(newDossier)
      setStep(2)

      // Upload file + run analysis in parallel with progress animation
      const [result] = await Promise.all([
        uploadDossierFile(newDossier.id, selectedFile).then(() => runAnalyse(newDossier.id)),
        runProgressAnimation(),
      ])

      setAnalyseProgress(100)
      setAnalyse(result)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse")
      setStep(1)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Importer un Business Plan</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Importez un fichier Excel et obtenez une analyse financière complète.
        </p>
      </div>

      <ImportSteps currentStep={step} />

      {step === 1 && (
        <ImportForm
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
          onFileRemove={() => setSelectedFile(null)}
          onSubmit={handleSubmit}
          error={error}
          isSubmitting={isSubmitting}
        />
      )}

      {step === 2 && (
        <AnalyseProgress stepIndex={analyseStepIndex} progress={analyseProgress} />
      )}

      {step === 3 && dossier && analyse && (
        <AnalyseResult
          dossier={dossier}
          analyse={analyse}
          onGoToDashboard={() => router.push('/dashboard')}
          onGoToDossier={() => router.push(`/dossiers/${dossier.id}`)}
        />
      )}
    </div>
  )
}
