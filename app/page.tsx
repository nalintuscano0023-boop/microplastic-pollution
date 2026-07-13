import { OceanNavbar } from '@/components/ocean/navbar'
import { OceanHero } from '@/components/ocean/hero'
import { OceanDescent } from '@/components/ocean/descent'
import { PlasticJourney } from '@/components/ocean/journey'
import { HiddenSources } from '@/components/ocean/hidden-sources'
import { OceanReflection } from '@/components/ocean/reflection'

export default function Page() {
  return (
    <main className="relative bg-abyss">
      <OceanNavbar />
      <OceanHero />
      <OceanDescent />
      <PlasticJourney />
      <HiddenSources />
      <OceanReflection />
    </main>
  )
}
