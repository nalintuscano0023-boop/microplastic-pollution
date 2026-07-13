'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { OceanParticles } from './particles'

const depthLines = [
  'You are now 200 meters below the surface.',
  'The light begins to fade.',
  'And something else drifts here, too.',
]

export function OceanDescent() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])

  return (
    <section
      ref={ref}
      aria-label="Descending into the deep"
      className="relative overflow-hidden bg-abyss"
    >
      <motion.div
        aria-hidden="true"
        style={{ y: imageY }}
        className="absolute inset-[-14%]"
      >
        <Image
          src="/images/ocean-deep.png"
          alt=""
          fill
          className="object-cover opacity-70"
          sizes="100vw"
        />
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss"
      />
      <OceanParticles density={70} />

      <div className="relative z-10 mx-auto flex min-h-[140vh] max-w-2xl flex-col items-center justify-center gap-[30vh] px-6 py-[25vh] text-center">
        {depthLines.map((line, i) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, margin: '-20% 0px -20% 0px' }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className={`text-balance font-serif text-3xl leading-snug md:text-5xl ${
              i === depthLines.length - 1 ? 'text-primary' : 'text-foreground/90'
            }`}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </section>
  )
}
