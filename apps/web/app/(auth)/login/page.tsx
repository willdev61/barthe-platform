"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth-client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { data, error } = await signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    })

    if (error) {
      setError("Email ou mot de passe incorrect")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0]">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-md shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#534AB7] text-white font-bold text-lg px-4 py-2 rounded-lg mb-4">
            BARTHE
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Connexion</h1>
          <p className="text-sm text-gray-500 mt-1">
            Accédez à votre espace analyste
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
              placeholder="vous@institution.ci"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#534AB7] text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-center text-sm text-[#534AB7] hover:underline cursor-pointer">
            Mot de passe oublié ?
          </p>
        </form>
      </div>
    </div>
  )
}
