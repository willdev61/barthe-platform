import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  if (!session?.user) redirect('/login')

  const role = (session.user as Record<string, unknown>)?.role
  if (role !== 'admin') redirect('/dashboard')

  return <AdminShell>{children}</AdminShell>
}
