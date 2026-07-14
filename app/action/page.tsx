import type { Metadata } from 'next'
import { OceanNavbar } from '@/components/ocean/navbar'
import { QuestPanel } from '@/components/ocean/quest-panel'
import { ActionHero } from '@/components/action/action-hero'
import { RiskChecker } from '@/components/action/risk-checker'
import { ImpactSimulator } from '@/components/action/impact-simulator'
import { Alternatives } from '@/components/action/alternatives'
import { DailyChallenge } from '@/components/action/daily-challenge'
import { ResourceHub } from '@/components/action/resource-hub'
import { Pledge } from '@/components/action/pledge'

export const metadata: Metadata = {
  title: 'The Action Hub — The Unseen Ocean',
  description:
    'Measure your microplastic exposure, simulate how your habits reshape the ocean, and make a pledge the water can feel.',
}

export default function ActionPage() {
  return (
    <main className="relative bg-abyss">
      <OceanNavbar />
      <ActionHero />
      <RiskChecker />
      <ImpactSimulator />
      <Alternatives />
      <DailyChallenge />
      <ResourceHub />
      <Pledge />
      <QuestPanel />
    </main>
  )
}
