import { OceanNavbar } from '@/components/ocean/navbar'
import { OceanHero } from '@/components/ocean/hero'
import { OceanDescent } from '@/components/ocean/descent'
import { PlasticJourney } from '@/components/ocean/journey'
import { PlasticVision } from '@/components/ocean/plastic-vision'
import { HiddenSources } from '@/components/ocean/hidden-sources'
import { OceanReflection } from '@/components/ocean/reflection'
import { QuestPanel } from '@/components/ocean/quest-panel'

export default function Page() {
  return (
    <main className="relative bg-abyss">
      <OceanNavbar />
      <OceanHero />
      <OceanDescent />
      <PlasticJourney />
      <PlasticVision />
      <HiddenSources />
      <OceanReflection />
      <QuestPanel />
    </main>
  )
}
