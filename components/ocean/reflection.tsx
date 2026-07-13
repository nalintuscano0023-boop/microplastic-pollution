'use client'

import { motion } from 'framer-motion'
import { OceanParticles } from './particles'

export function OceanReflection() {
  return (
    <section
      id="reflection"
      aria-label="Reflection"
      className="relative overflow-hidden bg-abyss"
    >
      <OceanParticles density={50} />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-32 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 1.2 }}
          className="text-sm uppercase tracking-[0.35em] text-primary"
        >
          Reflection
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
          className="mt-6 text-balance font-serif text-4xl leading-tight text-foreground md:text-6xl"
        >
          The ocean does not forget. But it can still recover.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="mt-8 max-w-xl text-pretty leading-relaxed text-muted-foreground"
        >
          Every bottle refused, every synthetic wash reduced, every product
          chosen carefully keeps invisible plastic out of the water — and off
          your plate. The journey you just took starts and ends with a single
          choice.
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 1, delay: 0.8 }}
          href="#top"
          className="glass glass-glow mt-12 rounded-full px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-transform duration-300 hover:scale-105 hover:text-primary"
        >
          Return to the Surface
        </motion.a>

        <footer className="mt-24 text-xs tracking-wide text-muted-foreground/70">
          The Unseen Ocean — an immersive story about microplastic pollution.
        </footer>
      </div>
    </section>
  )
}
