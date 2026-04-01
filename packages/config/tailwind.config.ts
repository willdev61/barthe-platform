// packages/config/tailwind.config.ts
// Shared Tailwind 4 config for @barthe/config
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    '../../apps/web/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}

export default config
