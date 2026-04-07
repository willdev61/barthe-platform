import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'

interface TrialExpirationEmailProps {
  userName: string
  institutionNom: string
  joursRestants: number
  dashboardUrl: string
  webUrl: string
}

export function TrialExpirationEmail({
  userName,
  institutionNom,
  joursRestants,
  dashboardUrl,
  webUrl,
}: TrialExpirationEmailProps) {
  const isExpired = joursRestants === 0
  const subject = isExpired
    ? `Votre période d'essai a expiré — ${institutionNom}`
    : `Votre période d'essai expire dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}`

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>{subject}</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto mb-16 max-w-xl bg-white py-8 pb-16">
            <Section className="px-10">
              <div className="mb-6 inline-block rounded-xl bg-indigo-600 px-4 py-2">
                <Text className="m-0 text-lg font-bold text-white">BARTHE</Text>
              </div>
              <Hr className="my-4 border border-gray-200" />

              <Text className="text-base leading-6 text-gray-700">Bonjour {userName},</Text>

              {isExpired ? (
                <>
                  <Text className="text-base leading-6 text-gray-700">
                    La période d&apos;essai de <b>{institutionNom}</b> sur BARTHE a expiré. Votre
                    accès a été suspendu.
                  </Text>
                  <Text className="text-base leading-6 text-gray-700">
                    Contactez notre équipe pour activer votre abonnement et continuer à utiliser la
                    plateforme.
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-base leading-6 text-gray-700">
                    La période d&apos;essai de <b>{institutionNom}</b> sur BARTHE expire dans{' '}
                    <b>{joursRestants} jour{joursRestants > 1 ? 's' : ''}</b>.
                  </Text>
                  <Text className="text-base leading-6 text-gray-700">
                    Pour continuer à bénéficier de toutes les fonctionnalités, contactez notre équipe
                    avant l&apos;expiration.
                  </Text>
                </>
              )}

              <Button
                className="my-6 block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white"
                href={dashboardUrl}
              >
                Accéder à la plateforme
              </Button>

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
