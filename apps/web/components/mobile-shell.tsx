'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { AppToolbar } from '@/components/app-toolbar'
import { TrialBanner } from '@/components/trial-banner'
import { cn } from '@/lib/utils'

export function MobileShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppToolbar onMenuToggle={() => setOpen((v) => !v)} />
        <TrialBanner />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
