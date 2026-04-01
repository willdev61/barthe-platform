// ---- Auth lib — client-side session via cookie ----

import type { User } from './types'
import { MOCK_USER } from './mock-data'

const SESSION_KEY = 'barthe_session'

export interface Session {
  user: User
  token: string
  expires_at: string
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: Session = JSON.parse(raw)
    if (new Date(session.expires_at) < new Date()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function setSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export async function loginMock(
  email: string,
  _password: string
): Promise<Session> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800))
  if (!email.includes('@')) {
    throw new Error('Email ou mot de passe incorrect')
  }
  const expires = new Date()
  expires.setHours(expires.getHours() + 24)
  const session: Session = {
    user: { ...MOCK_USER, email },
    token: 'mock-jwt-token-' + Date.now(),
    expires_at: expires.toISOString(),
  }
  setSession(session)
  return session
}

export async function logout(): Promise<void> {
  clearSession()
}
