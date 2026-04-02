'use client'

import { useState, useRef, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { Check, AlertTriangle, Upload, X, Image as ImageIcon, SlidersHorizontal, Tags, FileText } from 'lucide-react'
import type { Institution, InstitutionSettings } from '../../types'
import { getMyInstitution, updateInstitutionSettings, uploadInstitutionLogo } from '../../services/settings-service'
import { Section } from '../components/section'
import { cn } from '@/lib/utils'

const SECTEURS_DISPONIBLES = [
  'Agriculture', 'Agroalimentaire', 'Commerce général', 'Services numériques',
  'Transport & Logistique', 'Santé', 'Immobilier', 'Industrie', 'Énergie',
  'Finance & Assurance', 'Tourisme & Hôtellerie', 'BTP & Construction',
  'Éducation', 'Télécommunications',
] as const

const DEFAULT_SETTINGS: InstitutionSettings = {
  scoring_thresholds: { ebitda_min: 20, levier_max: 3.0, dscr_min: 1.2 },
  secteurs_actifs: [],
  rapport_logo_url: null,
  rapport_mentions: 'Document confidentiel',
}

function NumberField({ label, value, onChange, min, max, step, unit, hint }: {
  label: string; value: number; onChange: (v: number) => void
  min?: number; max?: number; step?: number; unit?: string; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min} max={max} step={step ?? 0.1}
          className="w-28 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

export function SettingsPage() {
  const { data: institution, isLoading } = useSWR<Institution>('institution/me', getMyInstitution)
  const [form, setForm] = useState<InstitutionSettings>(DEFAULT_SETTINGS)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (institution?.settings) {
      setForm(institution.settings)
      if (institution.settings.rapport_logo_url) setLogoPreview(institution.settings.rapport_logo_url)
    }
  }, [institution])

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')
    try {
      await updateInstitutionSettings(form)
      await mutate('institution/me')
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    setUploadingLogo(true)
    try {
      const logoUrl = await uploadInstitutionLogo(file)
      setForm((prev) => ({ ...prev, rapport_logo_url: logoUrl }))
    } catch {
      setLogoPreview(form.rapport_logo_url)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setForm((prev) => ({ ...prev, rapport_logo_url: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toggleSecteur = (secteur: string) => {
    setForm((prev) => ({
      ...prev,
      secteurs_actifs: prev.secteurs_actifs.includes(secteur)
        ? prev.secteurs_actifs.filter((s) => s !== secteur)
        : [...prev.secteurs_actifs, secteur],
    }))
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
            <div className="flex gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-muted rounded" />
                <div className="h-3 w-56 bg-muted rounded" />
              </div>
            </div>
            <div className="h-9 w-32 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {institution?.nom} · Configuration de l&apos;institution
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0',
            saveStatus === 'success' ? 'bg-green-600 text-white'
              : saveStatus === 'error' ? 'bg-destructive text-destructive-foreground'
              : 'bg-primary text-primary-foreground hover:opacity-90',
            saving && 'opacity-60 cursor-not-allowed'
          )}
        >
          {saveStatus === 'success' ? <><Check className="w-4 h-4" /> Sauvegardé</>
            : saveStatus === 'error' ? <><AlertTriangle className="w-4 h-4" /> Erreur</>
            : saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
      </div>

      <div className="space-y-6">
        <Section icon={SlidersHorizontal} title="Seuils de scoring" description="Personnalisez les seuils utilisés pour l'évaluation financière et le calcul du score.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <NumberField label="EBITDA min" value={form.scoring_thresholds.ebitda_min} onChange={(v) => setForm((p) => ({ ...p, scoring_thresholds: { ...p.scoring_thresholds, ebitda_min: v } }))} min={0} max={100} unit="%" hint="Seuil EBITDA / CA" />
            <NumberField label="Levier max" value={form.scoring_thresholds.levier_max} onChange={(v) => setForm((p) => ({ ...p, scoring_thresholds: { ...p.scoring_thresholds, levier_max: v } }))} min={0} max={20} unit="x" hint="Dette / EBITDA" />
            <NumberField label="DSCR min" value={form.scoring_thresholds.dscr_min} onChange={(v) => setForm((p) => ({ ...p, scoring_thresholds: { ...p.scoring_thresholds, dscr_min: v } }))} min={0} max={5} unit="x" hint="Couverture dette" />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground">
              Score = +25 pts si EBITDA &gt; {form.scoring_thresholds.ebitda_min}% · +25 pts si Levier &lt; {form.scoring_thresholds.levier_max}x · +25 pts si DSCR &gt; {form.scoring_thresholds.dscr_min}x · +25 pts si aucune alerte critique
            </p>
          </div>
        </Section>

        <Section icon={Tags} title="Secteurs actifs" description="Sélectionnez les secteurs que votre institution finance.">
          <div className="flex flex-wrap gap-2">
            {SECTEURS_DISPONIBLES.map((s) => {
              const active = form.secteurs_actifs.includes(s)
              return (
                <button key={s} onClick={() => toggleSecteur(s)} className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors', active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground')}>
                  {active && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
                  {s}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {form.secteurs_actifs.length === 0 ? 'Aucun secteur sélectionné — tous les secteurs sont acceptés.' : `${form.secteurs_actifs.length} secteur${form.secteurs_actifs.length > 1 ? 's' : ''} sélectionné${form.secteurs_actifs.length > 1 ? 's' : ''}`}
          </p>
        </Section>

        <Section icon={ImageIcon} title="Logo institution" description="Ce logo apparaîtra dans l'en-tête de tous les rapports PDF générés.">
          <div className="flex items-start gap-4">
            <div className={cn('flex items-center justify-center w-24 h-16 rounded-lg border-2 border-dashed shrink-0 overflow-hidden', logoPreview ? 'border-border' : 'border-border bg-muted/30')}>
              {logoPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={logoPreview} alt="Logo institution" className="w-full h-full object-contain" />
                : <ImageIcon className="w-6 h-6 text-muted-foreground/40" />}
            </div>
            <div className="flex-1 space-y-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
              <label htmlFor="logo-upload" className={cn('inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-accent', uploadingLogo && 'opacity-60 cursor-not-allowed pointer-events-none')}>
                <Upload className="w-4 h-4" />
                {uploadingLogo ? 'Envoi…' : 'Choisir un fichier'}
              </label>
              {logoPreview && (
                <button onClick={handleRemoveLogo} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-3 h-3" /> Supprimer le logo
                </button>
              )}
              <p className="text-xs text-muted-foreground">PNG, JPG, SVG · Max 2 Mo · Fond transparent recommandé</p>
            </div>
          </div>
        </Section>

        <Section icon={FileText} title="Mentions légales" description="Texte affiché dans le pied de page de tous les rapports PDF générés.">
          <textarea
            value={form.rapport_mentions}
            onChange={(e) => setForm((p) => ({ ...p, rapport_mentions: e.target.value }))}
            rows={3} maxLength={300}
            placeholder="Document confidentiel — usage interne uniquement"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1.5">{form.rapport_mentions.length}/300 caractères</p>
        </Section>
      </div>
    </div>
  )
}
