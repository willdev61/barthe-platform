'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BarChart3, Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginMock } from '@/lib/auth'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'aminata.kone@ba-ci.com',
      password: 'demo1234',
    },
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError(null)
    try {
      await loginMock(data.email, data.password)
      router.push('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur de connexion')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
              <BarChart3 className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              BARTHE
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Plateforme d&apos;analyse de Business Plans
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
                  errors.email ? 'border-destructive' : 'border-input'
                )}
                placeholder="votre@institution.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={cn(
                    'w-full px-3.5 py-2.5 pr-10 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
                    errors.password ? 'border-destructive' : 'border-input'
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div
                className="px-3.5 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg"
                role="alert"
              >
                <p className="text-sm text-destructive">{serverError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg',
                'bg-primary text-primary-foreground text-sm font-semibold',
                'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'transition-all disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Demo hint */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Mode démonstration — identifiants pré-remplis
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} BARTHE · Tous droits réservés
        </p>
      </div>
    </div>
  )
}
