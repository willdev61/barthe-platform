'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '../components/auth-layout'
import { RegisterForm } from '../forms/register-form'

export function RegisterPage() {
  const router = useRouter()
  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-sm text-gray-500 mt-1">Rejoignez la plateforme BARTHE</p>
        </div>
        <RegisterForm onSuccess={() => router.push('/dashboard')} />
        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#534AB7] font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
