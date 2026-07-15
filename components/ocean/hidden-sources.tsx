'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { HOTSPOT_COUNT, useEcoStore } from '@/lib/eco-store'

type Hotspot = {
  id: string
  label: string
  x: number // percentage
  y: number // percentage
  how: string
  travel: string
  alternative: string
  tip: string
}

const hotspots: Hotspot[] = [
  {
    id: 'bottle',
    label: 'Plastic water bottle',
    x: 37,
    y: 62,
    how: 'Each squeeze, twist, and refill sheds microscopic fragments into the water you drink.',
    travel: 'Discarded bottles fragment in landfills and waterways for centuries.',
    alternative: 'A stainless steel bottle lasts decades and sheds nothing.',
    tip: 'Refill at home before leaving — most bottled water is just filtered tap.',
  },
  {
    id: 'teabags',
    label: 'Tea bags',
    x: 44,
    y: 65,
    how: 'Many "silky" tea bags are woven plastic. Hot water releases billions of micro and nanoplastics per cup.',
    travel: 'Particles go directly into your body — and down the drain.',
    alternative: 'Loose leaf tea with a steel infuser tastes better and sheds nothing.',
    tip: 'Paper tea bags labeled "plastic-free" are a safe middle ground.',
  },
  {
    id: 'containers',
    label: 'Food containers',
    x: 53,
    y: 62,
    how: 'Heating plastic containers accelerates the shedding of particles into food, especially fatty meals.',
    travel: 'Washed residue enters wastewater that treatment plants cannot fully filter.',
    alternative: 'Glass or steel containers survive the microwave without shedding.',
    tip: 'Never microwave food in plastic — transfer to a plate or glass first.',
  },
  {
    id: 'clothing',
    label: 'Synthetic clothing',
    x: 92,
    y: 74,
    how: 'Polyester and nylon release hundreds of thousands of microfibers with every wash cycle.',
    travel: 'Laundry water carries fibers straight to rivers and, eventually, the sea.',
    alternative: 'Cotton, linen, and wool shed natural fibers that biodegrade.',
    tip: 'Wash synthetics cold, full-load, and less often — friction sheds fibers.',
  },
  {
    id: 'sponge',
    label: 'Kitchen sponge',
    x: 76,
    y: 48,
    how: 'Every scrub wears down the polyurethane foam, releasing fragments onto dishes and into the sink.',
    travel: 'Fragments flow through drains into the water cycle.',
    alternative: 'A natural loofah or wooden brush scrubs just as well.',
    tip: 'Compost worn-out natural sponges instead of binning plastic ones.',
  },
  {
    id: 'cuttingboard',
    label: 'Cutting board',
    x: 60,
    y: 66,
    how: 'Knife cuts on polyethylene boards can transfer millions of microplastic particles into food each year.',
    travel: 'Ingested directly, or rinsed into wastewater.',
    alternative: 'A wooden board is naturally antimicrobial and knife-friendly.',
    tip: 'If you keep plastic boards, retire them once deeply scarred.',
  },
  {
    id: 'toothbrush',
    label: 'Toothbrush',
    x: 68,
    y: 48,
    how: 'Nylon bristles and plastic handles wear down with every brush — a billion toothbrushes are discarded yearly.',
    travel: 'Worn bristle fragments rinse down the drain twice a day.',
    alternative: 'Bamboo-handled brushes cut the plastic by 90%.',
    tip: 'Replace only the head if your brush supports it.',
  },
  {
    id: 'cosmetics',
    label: 'Cosmetics',
    x: 96,
    y: 38,
    how: 'Exfoliants, glitters, and film-formers in many products are intentionally added microplastics.',
    travel: 'Rinsed off skin, they slip past filters and enter waterways.',
    alternative: 'Look for "polyethylene-free" labels and mineral-based glitter.',
    tip: 'Scan ingredient lists for polyethylene (PE) and polypropylene (PP).',
  },
]

export function HiddenSources() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = hotspots.find((h) => h.id === activeId) ?? null
  const discoverHotspot = useEcoStore((s) => s.discoverHotspot)
  const discovered = useEcoStore((s) => s.discoveredHotspots)

  const open = (id: string) => {
    setActiveId(id)
    discoverHotspot(id)
  }

  return (
    <section
      id="hidden"
      aria-label="Where are microplastics hiding"
      className="relative bg-abyss py-24 md:py-36"
    >
      {/* Rising to the surface gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-abyss to-transparent"
      />

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-primary">
            Back at the surface
          </p>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-tight text-foreground md:text-6xl">
            Where are microplastics hiding?
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            The journey does not begin in the ocean. It begins at home. Explore
            the room — each glowing point is a quiet source.
          </p>
          <p
            className="glass mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs tracking-wide text-foreground/80"
            role="status"
            aria-live="polite"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {discovered.length} of {HOTSPOT_COUNT} sources discovered
            {discovered.length === HOTSPOT_COUNT && ' — Plastic Detective!'}
          </p>
        </motion.div>

        {/* Interactive scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative mt-16 overflow-hidden rounded-3xl border border-border shadow-2xl"
        >
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="/images/kitchen.png"
              alt="A modern kitchen with everyday objects that shed microplastics"
              fill
              className="object-cover"
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-abyss/50 via-transparent to-transparent"
            />

            {hotspots.map((h) => (
              <button
                key={h.id}
                type="button"
                aria-label={`Learn about ${h.label}`}
                aria-expanded={activeId === h.id}
                onMouseEnter={() => open(h.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => open(h.id)}
                onBlur={() => setActiveId(null)}
                onClick={() => {
                  discoverHotspot(h.id)
                  setActiveId((cur) => (cur === h.id ? null : h.id))
                }}
                className={`hotspot-pulse absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border backdrop-blur-sm transition-transform duration-300 hover:scale-125 focus-visible:scale-125 ${
                  discovered.includes(h.id)
                    ? 'border-accent/80 bg-accent/50'
                    : 'border-primary/70 bg-primary/50'
                }`}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                <span
                  className={`absolute inset-1 rounded-full ${
                    discovered.includes(h.id) ? 'bg-accent' : 'bg-primary'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Floating detail card */}
          <AnimatePresence>
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="glass glass-glow pointer-events-none absolute bottom-5 left-1/2 z-20 w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 rounded-2xl p-6"
                role="status"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-primary">
                  {active.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {active.how}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {active.travel}
                </p>
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-sm leading-relaxed text-accent">
                    ↺ {active.alternative}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    Tip: {active.tip}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Beyond the home */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'Car tyres',
              body: 'Tyre wear is one of the largest sources of microplastics on Earth — rain washes the dust from roads to rivers.',
            },
            {
              title: 'Plastic packaging',
              body: 'Opening, tearing, and cutting packaging releases fragments directly onto the food it protects.',
            },
            {
              title: 'The laundry cycle',
              body: 'A single load of synthetic laundry can release over 700,000 microfibers into wastewater.',
            },
          ].map((card, i) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
              className="glass float-gentle rounded-2xl p-7"
              style={{ animationDelay: `${i * -2}s` }}
            >
              <h3 className="font-serif text-2xl text-foreground">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {card.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
