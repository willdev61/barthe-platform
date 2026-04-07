'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { AppToolbar } from '@/components/app-toolbar'
import { TrialBanner } from '@/components/trial-banner'
import { ProfileDialog } from '@/features/settings/views/dialogs/profile-dialog'
import { ImportModal } from '@/features/import/views/components/import-modal'
import { SpeedDial } from '@/components/speed-dial'
import { ImportModalProvider } from '@/lib/import-modal-context'
import { cn } from '@/lib/utils'

export function MobileShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    setCollapsed(localStorage.getItem('app-sidebar-collapsed') === 'true')
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      localStorage.setItem('app-sidebar-collapsed', String(!v))
      return !v
    })
  }

  return (
    <ImportModalProvider onOpen={() => setImportOpen(true)}>
      <div className="flex h-screen overflow-hidden bg-background">
        <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
        <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />

        {open && (
          <div
            className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          className={cn(
            'fixed inset-y-0 left-0 z-40 lg:static lg:z-auto',
            'transform transition-transform duration-200 ease-in-out',
            open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <Sidebar
            onClose={() => setOpen(false)}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapsed}
            onOpenProfile={() => setProfileOpen(true)}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AppToolbar onMenuToggle={() => setOpen((v) => !v)} />
          <TrialBanner />
          <main className="flex-1 overflow-y-auto relative">
            {children}
            <SpeedDial onImport={() => setImportOpen(true)} />
          </main>
        </div>
      </div>
    </ImportModalProvider>
  )
}
