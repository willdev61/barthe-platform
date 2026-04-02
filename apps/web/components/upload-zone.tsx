'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onRemove: () => void
  disabled?: boolean
}

export function UploadZone({
  onFileSelect,
  selectedFile,
  onRemove,
  disabled = false,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled,
  })

  const isPdf = selectedFile?.name.toLowerCase().endsWith('.pdf')

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between p-4 bg-score-favorable-bg border border-score-favorable/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-score-favorable/10 rounded-lg shrink-0">
            {isPdf ? (
              <FileText className="w-5 h-5 text-score-favorable" />
            ) : (
              <FileSpreadsheet className="w-5 h-5 text-score-favorable" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-score-favorable truncate max-w-xs">
              {selectedFile.name}
            </p>
            <p className="text-xs text-score-favorable/70">
              {(selectedFile.size / 1024).toFixed(1)} Ko
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          disabled={disabled}
          className="p-1.5 rounded-lg text-score-favorable hover:bg-score-favorable/10 transition-colors"
          aria-label="Supprimer le fichier"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
        isDragActive
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-border hover:border-primary/50 hover:bg-accent/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            'flex items-center justify-center w-14 h-14 rounded-full transition-colors',
            isDragActive ? 'bg-primary/10' : 'bg-muted'
          )}
        >
          <Upload
            className={cn(
              'w-6 h-6',
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isDragActive
              ? 'Déposez le fichier ici'
              : 'Glissez votre Business Plan'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, Excel (.xlsx, .xls) ou CSV — taille max 10 Mo
          </p>
        </div>
        <span className="text-xs text-primary font-medium underline underline-offset-2">
          Parcourir les fichiers
        </span>
      </div>
    </div>
  )
}
