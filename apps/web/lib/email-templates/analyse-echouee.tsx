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

interface AnalyseEchoueeEmailProps {
  userName: string
  dossierNom: string
  dashboardUrl: string
  webUrl: string
}

export function AnalyseEchoueeEmail({
  userName,
  dossierNom,
  dashboardUrl,
  webUrl,
}: AnalyseEchoueeEmailProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Échec de l&apos;analyse — {dossierNom}</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto mb-16 max-w-xl bg-white py-8 pb-16">
            <Section className="px-10">
              <div className="mb-6 inline-block rounded-xl bg-indigo-600 px-4 py-2">
                <Text className="m-0 text-lg font-bold text-white">BARTHE</Text>
              </div>
              <Hr className="my-4 border border-gray-200" />

              <Text className="text-base leading-6 text-gray-700">Bonjour {userName},</Text>
              <Text className="text-base leading-6 text-gray-700">
                L&apos;analyse du dossier <b>{dossierNom}</b> a échoué. Veuillez vérifier le fichier
                importé et réessayer.
              </Text>
              <Text className="text-base leading-6 text-gray-700">
                Si le problème persiste, contactez votre administrateur.
              </Text>

              <Button
                className="my-6 block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white"
                href={dashboardUrl}
              >
                Retourner au tableau de bord
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
