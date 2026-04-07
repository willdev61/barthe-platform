'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { mutate } from 'swr'
import type { Dossier, Analyse } from '@/lib/types'
import { createDossier } from '@/features/dossiers/services/dossier-service'
import { uploadDossierFile, runAnalyse } from '../../services/import-service'
import type { ImportFormData } from '../../schemas/import-schema'
import { ImportSteps } from './import-steps'
import { ImportForm } from '../forms/import-form'
import { AnalyseProgress, ANALYSE_STEPS_DURATIONS } from './analyse-progress'
import { AnalyseResult } from './analyse-result'

interface ImportModalProps {
  open: boolean
  onClose: () => void
}

export function ImportModal({ open, onClose }: ImportModalProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analyseStepIndex, setAnalyseStepIndex] = useState(0)
  const [analyseProgress, setAnalyseProgress] = useState(0)
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [analyse, setAnalyse] = useState<Analyse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!open) return null

  const handleClose = () => {
    // Reset state on close
    setStep(1)
    setSelectedFile(null)
    setAnalyseStepIndex(0)
    setAnalyseProgress(0)
    setDossier(null)
    setAnalyse(null)
    setError(null)
    onClose()
  }

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
    if (!selectedFile) { setError('Veuillez sélectionner un fichier'); return }
    setIsSubmitting(true)
    setError(null)
    try {
      const newDossier = await createDossier({ nom_projet: data.nom_projet, fichier_nom: selectedFile.name })
      setDossier(newDossier)
      setStep(2)
      const [result] = await Promise.all([
        uploadDossierFile(newDossier.id, selectedFile).then(() => runAnalyse(newDossier.id)),
        runProgressAnimation(),
      ])
      setAnalyseProgress(100)
      setAnalyse(result)
      setStep(3)
      // Refresh dossiers list in background
      mutate('dossiers')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse")
      setStep(1)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={step === 2 ? undefined : handleClose} />

      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-base font-semibold text-foreground">Importer un Business Plan</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Importez un fichier Excel et obtenez une analyse financière complète.</p>
          </div>
          {step !== 2 && (
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
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
              onGoToDashboard={handleClose}
              onGoToDossier={() => {
                handleClose()
                router.push(`/dossiers/${dossier.id}`)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
