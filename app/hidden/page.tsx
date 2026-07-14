import type { Metadata } from 'next'
import { OceanNavbar } from '@/components/ocean/navbar'
import { SectionIntro } from '@/components/ocean/section-intro'
import { PlasticVision } from '@/components/ocean/plastic-vision'
import { HiddenSources } from '@/components/ocean/hidden-sources'
import { NextSection } from '@/components/ocean/next-section'
import { QuestPanel } from '@/components/ocean/quest-panel'

export const metadata: Metadata = {
  title: 'The Invisible — The Unseen Ocean',
  description:
    'Switch on Plastic Vision to reveal the microplastics drifting through the water, then explore the everyday objects at home that shed them.',
}

export default function HiddenPage() {
  return (
    <main className="relative bg-abyss">
      <OceanNavbar />
      <SectionIntro
        index="02"
        eyebrow="The Invisible"
        title="What you cannot see is already everywhere."
        subtitle="The water looks clean and your home looks harmless. Look closer — microplastics hide in both, and the two are connected."
        tone="abyss"
        scrollHint="Reveal the invisible"
      />
      <PlasticVision />
      <HiddenSources />
      <NextSection
        index="03"
        eyebrow="The Ripple"
        title="Now see how a single week of your habits ripples through the ocean."
        href="/ripple"
        cta="Enter the simulator"
      />
      <QuestPanel />
    </main>
  )
}
