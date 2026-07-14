'use client'

import { motion } from 'framer-motion'
import { OceanParticles } from '@/components/ocean/particles'

export function ActionHero() {
  return (
    <section
      aria-label="Action hub introduction"
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden"
    >
      {/* surface light gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[oklch(0.4_0.09_215)] via-[oklch(0.22_0.06_235)] to-abyss"
      />
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="sun-ray absolute -top-20 left-[25%] h-[60vh] w-28 bg-gradient-to-b from-white/20 to-transparent blur-2xl" />
        <div
          className="sun-ray absolute -top-20 left-[60%] h-[70vh] w-24 bg-gradient-to-b from-white/15 to-transparent blur-2xl"
          style={{ animationDelay: '-4s' }}
        />
      </div>
      <OceanParticles density={35} />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2 }}
          className="text-sm uppercase tracking-[0.35em] text-primary"
        >
          The Action Hub
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.45 }}
          className="mt-6 text-balance font-serif text-5xl leading-tight text-foreground md:text-7xl"
        >
          The story was the ocean&apos;s. This part is yours.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.75 }}
          className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-foreground/80"
        >
          Measure your exposure, watch your choices reshape the water, and
          leave with a promise the ocean can feel.
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.05 }}
          href="#risk"
          className="glass glass-glow mt-12 inline-block rounded-full px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-transform duration-300 hover:scale-105 hover:text-primary"
        >
          Start with your risk check
        </motion.a>
      </div>
    </section>
  )
}
