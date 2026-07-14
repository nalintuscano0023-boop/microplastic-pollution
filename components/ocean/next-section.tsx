'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const MotionLink = motion.create(Link)

export function NextSection({
  index,
  eyebrow,
  title,
  href,
  cta,
}: {
  index: string
  eyebrow: string
  title: string
  href: string
  cta: string
}) {
  return (
    <section
      aria-label="Continue to the next section"
      className="relative overflow-hidden border-t border-border/50 bg-abyss py-24 md:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/40 to-transparent"
      />
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.8 }}
          className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
        >
          Next · {index} — {eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
          className="mt-5 text-balance font-serif text-3xl leading-snug text-foreground md:text-4xl"
        >
          {title}
        </motion.h2>
        <MotionLink
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.9, delay: 0.35 }}
          href={href}
          className="glass glass-glow mt-9 rounded-full bg-primary/20 px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-transform duration-300 hover:scale-105 hover:text-primary"
        >
          {cta} →
        </MotionLink>
      </div>
    </section>
  )
}
