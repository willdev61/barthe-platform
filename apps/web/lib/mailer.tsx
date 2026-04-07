import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { InvitationEmail } from './email-templates/invitation'
import { ResetPasswordEmail } from './email-templates/reset-password'
import { InstitutionWelcomeEmail } from './email-templates/institution-welcome'
import { AnalyseTermineeEmail } from './email-templates/analyse-terminee'
import { AnalyseEchoueeEmail } from './email-templates/analyse-echouee'
import { TrialExpirationEmail } from './email-templates/trial-expiration'
import { RoleModifieEmail } from './email-templates/role-modifie'
import { LimiteDossiersEmail } from './email-templates/limite-dossiers'
import { ApiKeyExpirationEmail } from './email-templates/api-key-expiration'

// ─── Transport ───────────────────────────────────────────────────────────────

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

const FROM = `BARTHE <${process.env.SMTP_FROM_ADDRESS ?? 'noreply@barthe.app'}>`
const WEB_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const transport = createTransport()
  await transport.sendMail({ from: FROM, to, subject, html })
}

// ─── Templates ───────────────────────────────────────────────────────────────

export async function sendInvitationEmail(params: {
  to: string
  inviteeName: string
  institutionName: string
  inviterName: string
  role: string
  invitationUrl: string
}): Promise<void> {
  const html = await render(
    <InvitationEmail
      inviteeName={params.inviteeName}
      institutionName={params.institutionName}
      inviterName={params.inviterName}
      role={params.role}
      invitationUrl={params.invitationUrl}
      webUrl={WEB_URL}
    />
  )
  await sendMail(params.to, `Invitation à rejoindre ${params.institutionName} sur BARTHE`, html)
}

export async function sendResetPasswordEmail(params: {
  to: string
  userName: string
  resetUrl: string
}): Promise<void> {
  const html = await render(
    <ResetPasswordEmail
      userName={params.userName}
      resetUrl={params.resetUrl}
      webUrl={WEB_URL}
    />
  )
  await sendMail(params.to, 'Réinitialisation de votre mot de passe BARTHE', html)
}

export async function sendInstitutionWelcomeEmail(params: {
  to: string
  institutionName: string
  setupUrl: string
}): Promise<void> {
  const html = await render(
    <InstitutionWelcomeEmail
      institutionName={params.institutionName}
      setupUrl={params.setupUrl}
      webUrl={WEB_URL}
    />
  )
  await sendMail(params.to, `Bienvenue sur BARTHE — ${params.institutionName}`, html)
}

export async function sendAnalyseTermineeEmail(params: {
  to: string
  userName: string
  dossierNom: string
  score: number
  dossierId: string
}): Promise<void> {
  const html = await render(
    <AnalyseTermineeEmail
      userName={params.userName}
      dossierNom={params.dossierNom}
      score={params.score}
      dossierUrl={`${WEB_URL}/dossiers/${params.dossierId}`}
      webUrl={WEB_URL}
    />
  )
  await sendMail(params.to, `Analyse terminée — ${params.dossierNom}`, html)
}

export async function sendAnalyseEchoueeEmail(params: {
  to: string
  userName: string
  dossierNom: string
}): Promise<void> {
  const html = await render(
    <AnalyseEchoueeEmail
      userName={params.userName}
      dossierNom={params.dossierNom}
      dashboardUrl={`${WEB_URL}/dashboard`}
      webUrl={WEB_URL}
    />
  )
  await sendMail(params.to, `Échec de l'analyse — ${params.dossierNom}`, html)
}

export async function sendTrialExpirationEmail(params: {
  to: string
  userName: string
  institutionNom: string
  joursRestants: number
}): Promise<void> {
  const html = await render(
    <TrialExpirationEmail
      userName={params.userName}
      institutionNom={params.institutionNom}
      joursRestants={params.joursRestants}
      dashboardUrl={`${WEB_URL}/dashboard`}
      webUrl={WEB_URL}
    />
  )
  const subject =
    params.joursRestants === 0
      ? `Votre période d'essai a expiré — ${params.institutionNom}`
      : `Votre période d'essai expire dans ${params.joursRestants} jour${params.joursRestants > 1 ? 's' : ''}`
  await sendMail(params.to, subject, html)
}

export async function sendRoleModifieEmail(params: {
  to: string
  userName: string
  newRole: string
  institutionNom: string
}): Promise<void> {
  const html = await render(
    <RoleModifieEmail
      userName={params.userName}
      newRole={params.newRole}
      institutionNom={params.institutionNom}
      webUrl={WEB_URL}
    />
  )
  await sendMail(params.to, 'Votre rôle a été modifié sur BARTHE', html)
}

export async function sendLimiteDossiersEmail(params: {
  to: string
  userName: string
  institutionNom: string
  limit: number
}): Promise<void> {
  const html = await render(
    <LimiteDossiersEmail
      userName={params.userName}
      institutionNom={params.institutionNom}
      limit={params.limit}
      webUrl={WEB_URL}
    />
  )
  await sendMail(params.to, `Limite de dossiers atteinte — ${params.institutionNom}`, html)
}

export async function sendApiKeyExpirationEmail(params: {
  to: string
  adminName: string
  keyName: string
  expiresAt: string
}): Promise<void> {
  const html = await render(
    <ApiKeyExpirationEmail
      adminName={params.adminName}
      keyName={params.keyName}
      expiresAt={params.expiresAt}
      webUrl={WEB_URL}
    />
  )
  await sendMail(params.to, `Clé API "${params.keyName}" expire bientôt`, html)
}
