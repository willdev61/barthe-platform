'use client'

import { createContext, useContext, useState } from 'react'

interface ImportModalContextValue {
  open: () => void
}

const ImportModalContext = createContext<ImportModalContextValue>({ open: () => {} })

export function ImportModalProvider({
  children,
  onOpen,
}: {
  children: React.ReactNode
  onOpen: () => void
}) {
  return (
    <ImportModalContext.Provider value={{ open: onOpen }}>
      {children}
    </ImportModalContext.Provider>
  )
}

export function useImportModal() {
  return useContext(ImportModalContext)
}
