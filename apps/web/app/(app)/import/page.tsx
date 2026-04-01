'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Loader2, ChevronRight, FileText, Zap, BarChart3 } from 'lucide-react'
import { UploadZone } from '@/components/upload-zone'
import { ScoreBadge } from '@/components/score-badge'
import { createDossier, runAnalyse } from '@/lib/api'
import type { Dossier, Analyse } from '@/lib/types'
import { getScoreLabel } from '@/lib/types'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Fichier & Projet' },
  { id: 2, label: 'Analyse en cours' },
  { id: 3, label: 'Résultat' },
]

const ANALYSE_STEPS = [
  { label: 'Lecture du fichier Excel…', duration: 800 },
  { label: 'Extraction des données…', duration: 700 },
  { label: 'Normalisation via LLM…', duration: 1200 },
  { label: 'Calcul des ratios financiers…', duration: 600 },
  { label: 'Scoring de finançabilité…', duration: 400 },
  { label: 'Génération de la synthèse…', duration: 700 },
]

const formSchema = z.object({
  nom_projet: z.string().min(2, 'Nom du projet requis (min. 2 caractères)'),
})

type FormData = z.infer<typeof formSchema>

export default function ImportPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analyseStepIndex, setAnalyseStepIndex] = useState(0)
  const [analyseProgress, setAnalyseProgress] = useState(0)
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [analyse, setAnalyse] = useState<Analyse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { nom_projet: '' },
  })

  const runAnalyseSteps = async (dossierId: string) => {
    let progress = 0
    const totalDuration = ANALYSE_STEPS.reduce((s, step) => s + step.duration, 0)
    let elapsed = 0

    for (let i = 0; i < ANALYSE_STEPS.length; i++) {
      setAnalyseStepIndex(i)
      await new Promise((r) => setTimeout(r, ANALYSE_STEPS[i].duration))
      elapsed += ANALYSE_STEPS[i].duration
      progress = Math.round((elapsed / totalDuration) * 90)
      setAnalyseProgress(progress)
    }

    // Run actual analysis
    const result = await runAnalyse(dossierId)
    setAnalyseProgress(100)
    setAnalyse(result)
    return result
  }

  const onSubmit = async (data: FormData) => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create dossier
      const newDossier = await createDossier({
        nom_projet: data.nom_projet,
        fichier_nom: selectedFile.name,
      })
      setDossier(newDossier)

      // Move to step 2
      setStep(2)

      // Run analysis with progress simulation
      // Use mock dossier-001 for demo since we only have mock data for dos-001
      await runAnalyseSteps('dos-001')

      // Move to step 3
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Importer un Business Plan
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Importez un fichier Excel et obtenez une analyse financière complète.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors',
                  step > s.id
                    ? 'bg-score-favorable text-white'
                    : step === s.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
              </div>
              <span
                className={cn(
                  'text-sm font-medium hidden sm:block',
                  step === s.id ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Upload + Project name */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            {/* Upload zone */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Fichier Business Plan
              </label>
              <UploadZone
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                onRemove={() => setSelectedFile(null)}
                disabled={isSubmitting}
              />
            </div>

            {/* Project name */}
            <div className="space-y-1.5">
              <label
                htmlFor="nom_projet"
                className="block text-sm font-medium text-foreground"
              >
                Nom du projet
              </label>
              <input
                id="nom_projet"
                type="text"
                {...register('nom_projet')}
                placeholder="ex: Agro-Export Abidjan SARL"
                disabled={isSubmitting}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm text-foreground',
                  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                  errors.nom_projet ? 'border-destructive' : 'border-input'
                )}
              />
              {errors.nom_projet && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.nom_projet.message}
                </p>
              )}
            </div>

            {error && (
              <div
                className="px-3.5 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg"
                role="alert"
              >
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedFile}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl',
              'bg-primary text-primary-foreground text-sm font-semibold',
              'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Zap className="w-4 h-4" />
            Lancer l&apos;analyse IA
          </button>
        </form>
      )}

      {/* Step 2 — Analysis in progress */}
      {step === 2 && (
        <div className="bg-card border border-border rounded-xl p-8 space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-5">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Analyse en cours…
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Notre IA analyse votre Business Plan
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>{analyseProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${analyseProgress}%` }}
                role="progressbar"
                aria-valuenow={analyseProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          {/* Step labels */}
          <div className="space-y-2.5">
            {ANALYSE_STEPS.map((s, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 text-sm transition-colors',
                  i < analyseStepIndex
                    ? 'text-score-favorable'
                    : i === analyseStepIndex
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    i < analyseStepIndex
                      ? 'bg-score-favorable'
                      : i === analyseStepIndex
                      ? 'bg-primary animate-pulse'
                      : 'bg-muted-foreground/30'
                  )}
                />
                {s.label}
                {i < analyseStepIndex && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-score-favorable ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Summary */}
      {step === 3 && analyse && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-score-favorable" />
              <h2 className="text-base font-semibold text-foreground">
                Analyse terminée
              </h2>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <ScoreBadge
                score={analyse.donnees_normalisees.ebitda && analyse.donnees_normalisees.chiffre_affaires ? 82 : 61}
                size="xl"
                showLabel
              />
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Score de finançabilité
                </p>
                <p className="text-lg font-bold text-foreground">
                  {dossier?.nom_projet}
                </p>
                <p className="text-sm text-muted-foreground">
                  Secteur : {analyse.donnees_normalisees.secteur}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                {
                  label: "Chiffre d'affaires",
                  value: analyse.donnees_normalisees.chiffre_affaires
                    ? `${(analyse.donnees_normalisees.chiffre_affaires / 1000000).toFixed(0)}M FCFA`
                    : '—',
                },
                {
                  label: 'EBITDA',
                  value: analyse.donnees_normalisees.ebitda
                    ? `${(analyse.donnees_normalisees.ebitda / 1000000).toFixed(0)}M FCFA`
                    : '—',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-muted/50 rounded-lg px-4 py-3"
                >
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Alerts count */}
            {analyse.alertes.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-score-reserve-bg border border-score-reserve/20 rounded-lg mb-4">
                <BarChart3 className="w-4 h-4 text-score-reserve shrink-0" />
                <p className="text-sm text-score-reserve">
                  {analyse.alertes.length} alerte
                  {analyse.alertes.length > 1 ? 's' : ''} détectée
                  {analyse.alertes.length > 1 ? 's' : ''} — consultez le
                  dossier complet.
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Retour au tableau de bord
            </button>
            <button
              onClick={() => router.push('/dossiers/dos-001')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <FileText className="w-4 h-4" />
              Voir l&apos;analyse complète
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
