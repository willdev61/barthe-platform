/**
 * Crée les tables better-auth (user, session, account, organization, member, invitation)
 * Usage : pnpm db:auth
 */
import { auth } from '../lib/auth'
import { getMigrations } from 'better-auth/db/migration'

async function main() {
  console.log('🔄 Migration des tables better-auth...')
  const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(auth.options)

  if (toBeCreated.length === 0 && toBeAdded.length === 0) {
    console.log('✅ Tables déjà à jour — rien à faire')
    process.exit(0)
  }

  if (toBeCreated.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log(`   → Tables à créer : ${toBeCreated.map((t: any) => t.table).join(', ')}`)
  }
  if (toBeAdded.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log(`   → Colonnes à ajouter dans : ${toBeAdded.map((t: any) => t.table).join(', ')}`)
  }

  await runMigrations()
  console.log('✅ Tables better-auth créées avec succès')
  process.exit(0)
}

main().catch((e) => {
  console.error('❌ Erreur migration:', e.message)
  process.exit(1)
})
