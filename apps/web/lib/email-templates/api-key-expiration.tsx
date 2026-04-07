import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'

interface ApiKeyExpirationEmailProps {
  adminName: string
  keyName: string
  expiresAt: string
  webUrl: string
}

export function ApiKeyExpirationEmail({ adminName, keyName, expiresAt, webUrl }: ApiKeyExpirationEmailProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Clé API &quot;{keyName}&quot; expire bientôt</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto mb-16 max-w-xl bg-white py-8 pb-16">
            <Section className="px-10">
              <div className="mb-6 inline-block rounded-xl bg-indigo-600 px-4 py-2">
                <Text className="m-0 text-lg font-bold text-white">BARTHE</Text>
              </div>
              <Hr className="my-4 border border-gray-200" />

              <Text className="text-base leading-6 text-gray-700">Bonjour {adminName},</Text>
              <Text className="text-base leading-6 text-gray-700">
                La clé API <b>&quot;{keyName}&quot;</b> expire le <b>{expiresAt}</b>. Pensez à la renouveler
                pour ne pas interrompre vos intégrations.
              </Text>

              <Hr className="my-6 border border-gray-200" />
              <Text className="text-xs leading-5 text-gray-400">
                BARTHE — Plateforme d&apos;analyse et d&apos;instruction financière de projets
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
