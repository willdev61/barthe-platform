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

interface AnalyseTermineeEmailProps {
  userName: string
  dossierNom: string
  score: number
  dossierUrl: string
  webUrl: string
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'Favorable', color: 'text-green-600' }
  if (score >= 45) return { label: 'Réservé', color: 'text-yellow-600' }
  return { label: 'Défavorable', color: 'text-red-600' }
}

export function AnalyseTermineeEmail({
  userName,
  dossierNom,
  score,
  dossierUrl,
  webUrl,
}: AnalyseTermineeEmailProps) {
  const { label } = getScoreLabel(score)

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>{`Analyse terminée — ${dossierNom} : ${score}/100`}</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto mb-16 max-w-xl bg-white py-8 pb-16">
            <Section className="px-10">
              <div className="mb-6 inline-block rounded-xl bg-indigo-600 px-4 py-2">
                <Text className="m-0 text-lg font-bold text-white">BARTHE</Text>
              </div>
              <Hr className="my-4 border border-gray-200" />

              <Text className="text-base leading-6 text-gray-700">Bonjour {userName},</Text>
              <Text className="text-base leading-6 text-gray-700">
                L&apos;analyse du dossier <b>{dossierNom}</b> est terminée.
              </Text>
              <Text className="text-base leading-6 text-gray-700">
                Score de finançabilité : <b>{score.toString()}/100</b> — {label}
              </Text>

              <Button
                className="my-6 block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white"
                href={dossierUrl}
              >
                Voir les résultats
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
