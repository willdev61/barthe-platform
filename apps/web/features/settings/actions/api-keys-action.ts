'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { randomBytes, createHash } from 'crypto'
import type { ApiKey } from '../types'

async function getInstitutionId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Non authentifié')
  const institutionId = session.session.activeOrganizationId
  if (!institutionId) throw new Error('Aucune institution active')
  return institutionId
}

function toApiKey(row: {
  id: string
  nom: string
  permissions: unknown
  key_prefix: string
  is_active: boolean
  last_used_at: Date | null
  expires_at: Date | null
  created_at: Date
}): ApiKey {
  return {
    id: row.id,
    nom: row.nom,
    permissions: row.permissions as string[],
    key_prefix: row.key_prefix,
    is_active: row.is_active,
    last_used_at: row.last_used_at?.toISOString() ?? null,
    expires_at: row.expires_at?.toISOString() ?? null,
    created_at: row.created_at.toISOString(),
  }
}

export async function getApiKeysAction(): Promise<ApiKey[]> {
  const institutionId = await getInstitutionId()
  const rows = await prisma.$queryRaw<
    {
      id: string
      nom: string
      permissions: unknown
      key_prefix: string
      is_active: boolean
      last_used_at: Date | null
      expires_at: Date | null
      created_at: Date
    }[]
  >`
    SELECT id, nom, permissions, key_prefix, is_active, last_used_at, expires_at, created_at
    FROM "ApiKey"
    WHERE institution_id = ${institutionId}
    ORDER BY created_at DESC
  `
  return rows.map(toApiKey)
}

export async function createApiKeyAction(data: {
  nom: string
  permissions: string[]
}): Promise<{ key: string; apiKey: ApiKey }> {
  const institutionId = await getInstitutionId()

  const rawKey = `bk_live_${randomBytes(24).toString('hex')}`
  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, 12)
  const id = randomBytes(16).toString('hex')

  await prisma.$executeRaw`
    INSERT INTO "ApiKey" (id, institution_id, nom, permissions, key_hash, key_prefix, is_active, created_at)
    VALUES (
      ${id},
      ${institutionId},
      ${data.nom},
      ${JSON.stringify(data.permissions)}::jsonb,
      ${keyHash},
      ${keyPrefix},
      true,
      NOW()
    )
  `

  const [row] = await prisma.$queryRaw<
    {
      id: string
      nom: string
      permissions: unknown
      key_prefix: string
      is_active: boolean
      last_used_at: Date | null
      expires_at: Date | null
      created_at: Date
    }[]
  >`
    SELECT id, nom, permissions, key_prefix, is_active, last_used_at, expires_at, created_at
    FROM "ApiKey" WHERE id = ${id}
  `

  return { key: rawKey, apiKey: toApiKey(row) }
}

export async function revokeApiKeyAction(keyId: string): Promise<void> {
  const institutionId = await getInstitutionId()
  await prisma.$executeRaw`
    UPDATE "ApiKey"
    SET is_active = false
    WHERE id = ${keyId} AND institution_id = ${institutionId}
  `
}
