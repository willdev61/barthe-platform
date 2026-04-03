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

interface InvitationEmailProps {
  inviteeName: string
  institutionName: string
  inviterName: string
  role: string
  invitationUrl: string
  webUrl: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  member: 'Analyste',
  owner: 'Propriétaire',
}

export function InvitationEmail({
  inviteeName,
  institutionName,
  inviterName,
  role,
  invitationUrl,
  webUrl,
}: InvitationEmailProps) {
  const roleLabel = ROLE_LABELS[role] ?? role

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Invitation à rejoindre {institutionName} sur BARTHE</Preview>
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
                Bonjour {inviteeName},
              </Text>
              <Text className="text-base leading-6 text-gray-700">
                <b>{inviterName}</b> vous invite à rejoindre <b>{institutionName}</b> sur
                la plateforme BARTHE en tant que <b>{roleLabel}</b>.
              </Text>
              <Text className="text-base leading-6 text-gray-700">
                BARTHE est une plateforme d&apos;analyse financière qui permet d&apos;instruire
                des dossiers de financement rapidement et rigoureusement.
              </Text>

              <Button
                className="my-6 block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white"
                href={invitationUrl}
              >
                Accepter l&apos;invitation
              </Button>

              <Text className="text-sm leading-6 text-gray-500">
                Ce lien d&apos;invitation est valable 48 heures. Si vous n&apos;attendiez pas
                cette invitation, vous pouvez ignorer cet email.
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
