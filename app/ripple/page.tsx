import type { Metadata } from 'next'
import { OceanNavbar } from '@/components/ocean/navbar'
import { SectionIntro } from '@/components/ocean/section-intro'
import { ImpactSimulator } from '@/components/action/impact-simulator'
import { Alternatives } from '@/components/action/alternatives'
import { OceanReflection } from '@/components/ocean/reflection'
import { QuestPanel } from '@/components/ocean/quest-panel'

export const metadata: Metadata = {
  title: 'The Ripple — The Unseen Ocean',
  description:
    'Move the sliders and watch your everyday habits reshape the ocean in real time, then discover the simple swaps that keep plastic out of the water.',
}

export default function RipplePage() {
  return (
    <main className="relative bg-abyss">
      <OceanNavbar />
      <SectionIntro
        index="03"
        eyebrow="The Ripple"
        title="Every choice you make reaches the water."
        subtitle="See how a single week of habits changes an entire reef — then meet the small, affordable swaps that turn the tide."
        tone="mid"
        scrollHint="Reshape the ocean"
      />
      <ImpactSimulator />
      <Alternatives />
      <OceanReflection />
      <QuestPanel />
    </main>
  )
}
