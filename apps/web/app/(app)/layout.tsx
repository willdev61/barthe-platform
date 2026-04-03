import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { MobileShell } from '@/components/mobile-shell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  if (!session?.user) redirect('/login')

  const role = (session.user as Record<string, unknown>)?.role
  if (role === 'admin') redirect('/admin')

  return <MobileShell>{children}</MobileShell>
}
