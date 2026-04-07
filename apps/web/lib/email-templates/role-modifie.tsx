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

interface RoleModifieEmailProps {
  userName: string
  newRole: string
  institutionNom: string
  webUrl: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  analyste: 'Analyste',
  lecture: 'Lecture seule',
  member: 'Analyste',
  owner: 'Propriétaire',
}

export function RoleModifieEmail({ userName, newRole, institutionNom, webUrl }: RoleModifieEmailProps) {
  const roleLabel = ROLE_LABELS[newRole] ?? newRole

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Votre rôle a été modifié sur BARTHE</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto mb-16 max-w-xl bg-white py-8 pb-16">
            <Section className="px-10">
              <div className="mb-6 inline-block rounded-xl bg-indigo-600 px-4 py-2">
                <Text className="m-0 text-lg font-bold text-white">BARTHE</Text>
              </div>
              <Hr className="my-4 border border-gray-200" />

              <Text className="text-base leading-6 text-gray-700">Bonjour {userName},</Text>
              <Text className="text-base leading-6 text-gray-700">
                Votre rôle au sein de <b>{institutionNom}</b> sur BARTHE a été modifié. Votre nouveau
                rôle est : <b>{roleLabel}</b>.
              </Text>
              <Text className="text-base leading-6 text-gray-700">
                Si vous avez des questions, contactez votre administrateur.
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
