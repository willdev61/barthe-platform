'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { importFormSchema, type ImportFormData } from '../../schemas/import-schema'
import { UploadZone } from '../components/upload-zone'

interface ImportFormProps {
  selectedFile: File | null
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  onSubmit: (data: ImportFormData) => void
  error: string | null
  isSubmitting: boolean
}

export function ImportForm({
  selectedFile,
  onFileSelect,
  onFileRemove,
  onSubmit,
  error,
  isSubmitting,
}: ImportFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ImportFormData>({
    resolver: zodResolver(importFormSchema),
    defaultValues: { nom_projet: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Fichier Business Plan
          </label>
          <UploadZone
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
            onRemove={onFileRemove}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="nom_projet" className="block text-sm font-medium text-foreground">
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
          <div className="px-3.5 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg" role="alert">
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
  )
}
