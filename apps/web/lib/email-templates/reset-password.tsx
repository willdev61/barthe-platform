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

interface ResetPasswordEmailProps {
  userName: string
  resetUrl: string
  webUrl: string
}

export function ResetPasswordEmail({ userName, resetUrl }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Réinitialisation de votre mot de passe BARTHE</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto mb-16 max-w-xl bg-white py-8 pb-16">
            <Section className="px-10">
              {/* Header */}
              <div className="mb-6 inline-block rounded-xl bg-indigo-600 px-4 py-2">
                <Text className="m-0 text-lg font-bold text-white">BARTHE</Text>
              </div>
              <Hr className="my-4 border border-gray-200" />

              {/* Content */}
              <Text className="text-base leading-6 text-gray-700">
                Bonjour {userName},
              </Text>
              <Text className="text-base leading-6 text-gray-700">
                Vous avez demandé la réinitialisation de votre mot de passe pour votre
                compte <b>BARTHE</b>. Cliquez sur le bouton ci-dessous pour créer un
                nouveau mot de passe :
              </Text>

              <Button
                className="my-6 block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white"
                href={resetUrl}
              >
                Réinitialiser mon mot de passe
              </Button>

              <Text className="text-sm leading-6 text-gray-500">
                Ce lien est valable 1 heure. Si vous n&apos;avez pas demandé cette
                réinitialisation, ignorez cet email — votre mot de passe restera inchangé.
              </Text>

              <Hr className="my-6 border border-gray-200" />
              <Text className="text-xs leading-5 text-gray-400">
                BARTHE — Plateforme d&apos;analyse et d&apos;instruction financière de projets
              </Text>
              <Text className="text-xs leading-5 text-gray-400">
                L&apos;équipe BARTHE
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
