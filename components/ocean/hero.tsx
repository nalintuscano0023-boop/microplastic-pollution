'use client'

import { useRef } from 'react'
import Image from 'next/image'
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { OceanParticles } from './particles'

export function OceanHero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Mouse-responsive parallax
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const parallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [12, -12]), {
    stiffness: 50,
    damping: 20,
  })
  const parallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 50,
    damping: 20,
  })

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  // Diving effect: image scales up + darkens as you scroll
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.35])
  const darken = useTransform(scrollYProgress, [0, 1], [0, 0.85])
  const textY = useTransform(scrollYProgress, [0, 0.6], [0, -120])
  const textOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0])

  return (
    <section
      ref={ref}
      id="top"
      aria-label="Introduction"
      className="relative h-[160vh]"
      onMouseMove={onMouseMove}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          style={{ scale, x: parallaxX, y: parallaxY }}
          className="absolute inset-[-16px]"
        >
          <Image
            src="/images/hero-ocean.png"
            alt="Crystal-clear tropical ocean with sun rays, coral reefs and a sea turtle"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>

        {/* Sun rays */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="sun-ray absolute -top-20 left-[15%] h-[70vh] w-24 bg-gradient-to-b from-white/25 to-transparent blur-2xl" />
          <div
            className="sun-ray absolute -top-20 left-[45%] h-[80vh] w-32 bg-gradient-to-b from-white/20 to-transparent blur-2xl"
            style={{ animationDelay: '-3s' }}
          />
          <div
            className="sun-ray absolute -top-20 left-[72%] h-[60vh] w-20 bg-gradient-to-b from-white/15 to-transparent blur-2xl"
            style={{ animationDelay: '-6s' }}
          />
        </div>

        <OceanParticles density={40} />

        {/* Depth darkening overlay */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-abyss"
          style={{ opacity: darken }}
        />

        {/* Copy */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="mb-6 text-sm uppercase tracking-[0.35em] text-primary"
          >
            An interactive documentary
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.55 }}
            className="max-w-4xl text-balance font-serif text-5xl leading-tight text-foreground md:text-7xl"
          >
            Plastic never truly disappears.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.9 }}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-foreground/80 md:text-xl"
          >
            It only becomes small enough that we stop seeing it.
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.25 }}
            href="#journey"
            className="glass glass-glow mt-12 rounded-full px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-transform duration-300 hover:scale-105 hover:text-primary"
          >
            Begin the Journey
          </motion.a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{ opacity: textOpacity }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-foreground/30 p-1.5">
            <motion.div
              className="h-2 w-1 rounded-full bg-foreground/70"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
