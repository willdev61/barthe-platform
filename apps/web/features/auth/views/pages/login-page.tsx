'use client'

import { useRouter } from 'next/navigation'
import { AuthCard } from '../components/auth-card'
import { LoginForm } from '../forms/login-form'

export function LoginPage() {
  const router = useRouter()
  return (
    <AuthCard title="Connexion" subtitle="Accédez à votre espace analyste">
      <LoginForm onSuccess={() => router.push('/dashboard')} />
    </AuthCard>
  )
}
