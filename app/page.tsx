import { OceanNavbar } from '@/components/ocean/navbar'
import { OceanHero } from '@/components/ocean/hero'
import { OceanDescent } from '@/components/ocean/descent'
import { PlasticJourney } from '@/components/ocean/journey'
import { NextSection } from '@/components/ocean/next-section'
import { QuestPanel } from '@/components/ocean/quest-panel'

export default function Page() {
  return (
    <main className="relative bg-abyss">
      <OceanNavbar />
      <OceanHero />
      <OceanDescent />
      <PlasticJourney />
      <NextSection
        index="02"
        eyebrow="The Invisible"
        title="The plastic didn't disappear. It just became too small to see."
        href="/hidden"
        cta="Reveal what's hidden"
      />
      <QuestPanel />
    </main>
  )
}
