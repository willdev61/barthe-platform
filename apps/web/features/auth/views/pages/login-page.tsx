'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '../components/auth-layout'
import { LoginForm } from '../forms/login-form'

export function LoginPage() {
  const router = useRouter()
  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
          <p className="text-sm text-gray-500 mt-1">Accédez à votre espace analyste</p>
        </div>
        <LoginForm onSuccess={() => router.push('/dashboard')} />
        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-[#534AB7] font-medium hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
