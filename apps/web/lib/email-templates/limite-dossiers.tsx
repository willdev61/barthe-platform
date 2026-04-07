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

interface LimiteDossiersEmailProps {
  userName: string
  institutionNom: string
  limit: number
  webUrl: string
}

export function LimiteDossiersEmail({ userName, institutionNom, limit, webUrl }: LimiteDossiersEmailProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Limite de dossiers atteinte — {institutionNom}</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto mb-16 max-w-xl bg-white py-8 pb-16">
            <Section className="px-10">
              <div className="mb-6 inline-block rounded-xl bg-indigo-600 px-4 py-2">
                <Text className="m-0 text-lg font-bold text-white">BARTHE</Text>
              </div>
              <Hr className="my-4 border border-gray-200" />

              <Text className="text-base leading-6 text-gray-700">Bonjour {userName},</Text>
              <Text className="text-base leading-6 text-gray-700">
                L&apos;institution <b>{institutionNom}</b> a atteint la limite de <b>{limit} dossiers</b>{' '}
                inclus dans votre période d&apos;essai. Aucun nouveau dossier ne peut être créé.
              </Text>
              <Text className="text-base leading-6 text-gray-700">
                Contactez notre équipe pour étendre votre accès.
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
