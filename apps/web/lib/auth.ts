import { betterAuth } from "better-auth"
import { Pool } from "pg"
import { organization, bearer, admin } from "better-auth/plugins"
import { sendInvitationEmail, sendResetPasswordEmail, sendInstitutionWelcomeEmail } from "./mailer"
import { prisma } from "./db"

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      const role = (user as Record<string, unknown>).role as string | undefined
      if (role === 'admin_institution') {
        const institution = await prisma.institution.findUnique({ where: { email_admin: user.email } })
        await sendInstitutionWelcomeEmail({
          to: user.email,
          institutionName: institution?.nom ?? user.name ?? user.email,
          setupUrl: url,
        })
      } else {
        await sendResetPasswordEmail({
          to: user.email,
          userName: user.name ?? user.email,
          resetUrl: url,
        })
      }
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 24h
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: false,
      membershipLimit: 50,
      sendInvitationEmail: async ({ email, inviter, organization: org, role, invitation }) => {
        const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/invitation?id=${invitation.id}`
        await sendInvitationEmail({
          to: email,
          inviteeName: email,
          institutionName: org.name,
          inviterName: inviter.user.name ?? inviter.user.email,
          role,
          invitationUrl,
        })
      },
    }),
    bearer(),
    admin(),
  ],
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "http://localhost:8000",
  ],
})

export type Auth = typeof auth
