import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { InvitationEmail } from './email-templates/invitation'
import { ResetPasswordEmail } from './email-templates/reset-password'

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
