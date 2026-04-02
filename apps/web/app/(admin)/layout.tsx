import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin-shell'

/**
 * Admin layout — server-side role guard.
 * In development / mock mode (NODE_ENV=development), the check is bypassed
 * so the back office is accessible without a real BetterAuth session.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev) {
    const session = await auth.api
      .getSession({ headers: await headers() })
      .catch(() => null)

    const role = (session?.user as Record<string, unknown> | undefined)?.role
    if (!session?.user || role !== 'admin') {
      redirect('/dashboard')
    }
  }

  return <AdminShell>{children}</AdminShell>
}
