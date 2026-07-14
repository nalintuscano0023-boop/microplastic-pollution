'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion'
import { useEcoStore } from '@/lib/eco-store'

type Stage = {
  image: string
  alt: string
  step: string
  title: string
  body: string
}

const stages: Stage[] = [
  {
    image: '/images/journey-bottle.png',
    alt: 'A plastic bottle floating on the calm ocean surface at golden hour',
    step: 'Stage 01',
    title: 'It begins at the surface',
    body: 'A single bottle drifts out to sea. Lightweight, buoyant, and built to last for centuries.',
  },
  {
    image: '/images/journey-cracking.png',
    alt: 'A weathered plastic bottle cracking under sunlight and waves',
    step: 'Stage 02',
    title: 'Sunlight begins its work',
    body: 'UV radiation and waves make the plastic brittle. It does not decompose — it only weakens.',
  },
  {
    image: '/images/journey-fragments.png',
    alt: 'Small broken plastic fragments drifting in blue ocean water',
    step: 'Stage 03',
    title: 'The bottle shatters',
    body: 'One object becomes hundreds of fragments, each carried in a different direction by the current.',
  },
  {
    image: '/images/journey-micro.png',
    alt: 'Nearly invisible microplastic particles suspended in deep water',
    step: 'Stage 04',
    title: 'It becomes invisible',
    body: 'Fragments break down below five millimeters. Microplastics now drift through every layer of the ocean.',
  },
  {
    image: '/images/journey-fish.png',
    alt: 'Small silver fish feeding among tiny suspended particles',
    step: 'Stage 05',
    title: 'The ocean mistakes it for food',
    body: 'Plankton-feeders cannot tell the difference. Microplastics enter the food web at its very base.',
  },
  {
    image: '/images/journey-bigfish.png',
    alt: 'A large predatory fish hunting a school of small silver fish',
    step: 'Stage 06',
    title: 'It climbs the food chain',
    body: 'Predators eat prey — and everything the prey has eaten. The particles concentrate at every step.',
  },
  {
    image: '/images/journey-plate.png',
    alt: 'An elegant dinner plate with grilled fish under dramatic lighting',
    step: 'Stage 07',
    title: 'It arrives at your table',
    body: 'Seafood, salt, and even drinking water now carry traces of the plastic we let slip away.',
  },
]

export function PlasticJourney() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const completeTimeMachine = useEcoStore((s) => s.completeTimeMachine)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(
      stages.length - 1,
      Math.floor(v * stages.length),
    )
    if (idx !== active) setActive(idx)
    if (idx === stages.length - 1) completeTimeMachine()
  })

  return (
    <section ref={ref} id="journey" aria-label="The journey of plastic" className="relative bg-abyss">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Crossfading imagery */}
        <AnimatePresence mode="sync">
          <motion.div
            key={stages[active].image}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Image
              src={stages[active].image}
              alt={stages[active].alt}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-abyss/85 via-abyss/30 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-abyss to-transparent"
        />

        {/* Stage card */}
        <div className="relative z-10 flex h-full items-center px-6 md:px-16">
          <AnimatePresence mode="wait">
            <motion.article
              key={stages[active].step}
              initial={{ opacity: 0, y: 36, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.98 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="glass glass-glow max-w-md rounded-3xl p-8 md:p-10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                {stages[active].step}
              </p>
              <h3 className="mt-4 text-balance font-serif text-3xl leading-snug text-foreground md:text-4xl">
                {stages[active].title}
              </h3>
              <p className="mt-4 text-pretty leading-relaxed text-foreground/80">
                {stages[active].body}
              </p>
            </motion.article>
          </AnimatePresence>
        </div>

        {/* Stage progress dots */}
        <div
          aria-hidden="true"
          className="absolute right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 md:right-12"
        >
          {stages.map((s, i) => (
            <div
              key={s.step}
              className={`h-2 w-2 rounded-full transition-all duration-500 ${
                i === active ? 'scale-125 bg-primary' : 'bg-foreground/25'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll runway — one viewport per stage */}
      <div aria-hidden="true" style={{ height: `${stages.length * 90}vh` }} />

      {/* Fade to black closing line */}
      <div className="relative flex min-h-screen items-center justify-center bg-abyss px-6">
        <motion.blockquote
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-25%' }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="max-w-3xl text-balance text-center font-serif text-4xl italic leading-snug text-foreground md:text-6xl"
        >
          {'"What leaves your hand eventually finds its way back."'}
        </motion.blockquote>
      </div>
    </section>
  )
}
