import { betterAuth } from "better-auth"
import { Pool } from "pg"
import { organization } from "better-auth/plugins"
import { bearer } from "better-auth/plugins"

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
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
    }),
    bearer(),
  ],
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "http://localhost:8000",
  ],
})

export type Auth = typeof auth
