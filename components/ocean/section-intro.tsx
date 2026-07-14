'use client'

import { motion } from 'framer-motion'
import { OceanParticles } from './particles'

type Tone = 'abyss' | 'mid' | 'surface'

const tones: Record<Tone, { gradient: string; particles: number; rays: boolean }> = {
  abyss: {
    gradient:
      'bg-gradient-to-b from-[oklch(0.14_0.05_245)] via-[oklch(0.11_0.04_248)] to-abyss',
    particles: 60,
    rays: false,
  },
  mid: {
    gradient:
      'bg-gradient-to-b from-[oklch(0.26_0.07_225)] via-[oklch(0.18_0.05_235)] to-abyss',
    particles: 45,
    rays: false,
  },
  surface: {
    gradient:
      'bg-gradient-to-b from-[oklch(0.4_0.09_215)] via-[oklch(0.22_0.06_235)] to-abyss',
    particles: 35,
    rays: true,
  },
}

export function SectionIntro({
  index,
  total = 4,
  eyebrow,
  title,
  subtitle,
  tone = 'mid',
  scrollHint = 'Scroll to explore',
}: {
  index: string
  total?: number
  eyebrow: string
  title: React.ReactNode
  subtitle: string
  tone?: Tone
  scrollHint?: string
}) {
  const t = tones[tone]

  return (
    <section
      aria-label={`${eyebrow} — section introduction`}
      className="relative flex min-h-[78vh] items-center justify-center overflow-hidden"
    >
      <div aria-hidden="true" className={`absolute inset-0 ${t.gradient}`} />

      {t.rays && (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="sun-ray absolute -top-20 left-[25%] h-[60vh] w-28 bg-gradient-to-b from-white/20 to-transparent blur-2xl" />
          <div
            className="sun-ray absolute -top-20 left-[62%] h-[70vh] w-24 bg-gradient-to-b from-white/15 to-transparent blur-2xl"
            style={{ animationDelay: '-4s' }}
          />
        </div>
      )}

      <OceanParticles density={t.particles} />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="mb-7 flex items-center justify-center gap-3"
        >
          <span className="font-serif text-3xl text-primary/70">{index}</span>
          <span className="h-px w-10 bg-border" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {String(total).padStart(2, '0')}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3 }}
          className="text-sm uppercase tracking-[0.35em] text-primary"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.5 }}
          className="mt-6 text-balance font-serif text-5xl leading-tight text-foreground md:text-7xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.8 }}
          className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-foreground/80"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* scroll hint */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          {scrollHint}
        </span>
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-foreground/25 p-1.5">
          <motion.div
            className="h-2 w-1 rounded-full bg-foreground/60"
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
