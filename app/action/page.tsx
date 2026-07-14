import type { Metadata } from 'next'
import { OceanNavbar } from '@/components/ocean/navbar'
import { QuestPanel } from '@/components/ocean/quest-panel'
import { ActionHero } from '@/components/action/action-hero'
import { RiskChecker } from '@/components/action/risk-checker'
import { DailyChallenge } from '@/components/action/daily-challenge'
import { ResourceHub } from '@/components/action/resource-hub'
import { Pledge } from '@/components/action/pledge'

export const metadata: Metadata = {
  title: 'Take Action — The Unseen Ocean',
  description:
    'Measure your microplastic exposure, take a daily eco challenge, find local resources, and make a pledge the ocean can feel.',
}

export default function ActionPage() {
  return (
    <main className="relative bg-abyss">
      <OceanNavbar />
      <ActionHero />
      <RiskChecker />
      <DailyChallenge />
      <ResourceHub />
      <Pledge />
      <QuestPanel />
    </main>
  )
}
