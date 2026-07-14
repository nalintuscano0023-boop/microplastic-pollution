'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { OceanParticles } from './particles'
import { useEcoStore } from '@/lib/eco-store'

const stats = [
  { value: '5.25 trillion', label: 'plastic pieces adrift in our oceans' },
  { value: '94%', label: 'of ocean plastic sinks below the surface' },
  { value: '100%', label: 'of sampled sea turtles contained plastic' },
]

const fishSchool = [
  { x: '18%', y: '38%', scale: 1, delay: 0 },
  { x: '58%', y: '30%', scale: 0.7, delay: 1.2 },
  { x: '74%', y: '58%', scale: 1.15, delay: 0.6 },
  { x: '36%', y: '64%', scale: 0.85, delay: 1.8 },
]

function ContaminatedFish({ scale = 1 }: { scale?: number }) {
  return (
    <svg
      width={90 * scale}
      height={44 * scale}
      viewBox="0 0 90 44"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 22C22 6 48 4 66 14l14-9-4 17 4 17-14-9C48 40 22 38 8 22Z"
        fill="oklch(0.72 0.05 220 / 45%)"
        stroke="oklch(0.85 0.06 200 / 50%)"
      />
      <circle cx="22" cy="20" r="2" fill="oklch(0.2 0.04 240 / 80%)" />
      {/* microplastic contamination */}
      <circle cx="40" cy="22" r="2" fill="oklch(0.78 0.15 55)" />
      <circle cx="50" cy="17" r="1.5" fill="oklch(0.78 0.15 55)" />
      <circle cx="47" cy="27" r="1.6" fill="oklch(0.82 0.13 195)" />
      <circle cx="57" cy="23" r="1.4" fill="oklch(0.78 0.15 55)" />
    </svg>
  )
}

export function PlasticVision() {
  const [on, setOn] = useState(false)
  const activateVision = useEcoStore((s) => s.activateVision)

  const toggle = () => {
    setOn((v) => {
      if (!v) activateVision()
      return !v
    })
  }

  return (
    <section
      id="vision"
      aria-label="Hidden plastic vision"
      className="relative overflow-hidden bg-abyss py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-primary">
            Hidden Plastic Vision
          </p>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-tight text-foreground md:text-6xl">
            The water looks clear. It isn&apos;t.
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            Microplastics are invisible to the naked eye. Switch on Plastic
            Vision to reveal what really drifts through every cubic meter of
            seawater.
          </p>
        </motion.div>

        {/* Scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative mt-14 overflow-hidden rounded-3xl border border-border shadow-2xl"
        >
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="/images/ocean-deep.png"
              alt="Deep blue ocean water that appears completely clean"
              fill
              className={`object-cover transition-all duration-1000 ${
                on ? 'brightness-75 saturate-75' : ''
              }`}
              sizes="(max-width: 1152px) 100vw, 1152px"
            />

            {/* Vision overlay */}
            <AnimatePresence>
              {on && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  {/* revealed microplastics */}
                  <OceanParticles density={130} color="255, 176, 98" />

                  {/* ocean current flow lines */}
                  <svg
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 1200 675"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    {[
                      'M-40 140 C 240 90, 480 210, 720 150 S 1140 90, 1260 160',
                      'M-40 360 C 300 300, 560 430, 860 350 S 1180 300, 1260 380',
                      'M-40 560 C 260 500, 520 620, 800 545 S 1160 500, 1260 570',
                    ].map((d, i) => (
                      <path
                        key={i}
                        d={d}
                        className="current-flow"
                        stroke="oklch(0.82 0.13 195 / 45%)"
                        strokeWidth="2"
                        strokeDasharray="10 14"
                        style={{ animationDelay: `${i * -2.5}s` }}
                      />
                    ))}
                  </svg>

                  {/* contaminated fish */}
                  {fishSchool.map((f, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{ left: f.x, top: f.y }}
                      animate={{ x: [0, 26, 0], y: [0, -8, 0] }}
                      transition={{
                        duration: 7 + i * 1.3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: f.delay,
                      }}
                    >
                      <ContaminatedFish scale={f.scale} />
                    </motion.div>
                  ))}

                  {/* density legend */}
                  <div className="glass absolute left-4 top-4 rounded-2xl px-4 py-3 md:left-6 md:top-6">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-primary">
                      Pollution density
                    </p>
                    <p className="mt-1 text-sm text-foreground/90">
                      ~11,000 particles per cubic meter
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle */}
            <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2">
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label="Toggle Plastic Vision"
                onClick={toggle}
                className="glass glass-glow flex items-center gap-3 rounded-full py-3 pl-5 pr-4 text-sm font-medium tracking-wide text-foreground transition-transform duration-300 hover:scale-105"
              >
                <span>{on ? 'Plastic Vision on' : 'Reveal the invisible'}</span>
                <span
                  className={`relative h-6 w-11 rounded-full border transition-colors duration-500 ${
                    on
                      ? 'border-primary/60 bg-primary/40'
                      : 'border-foreground/25 bg-foreground/10'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground shadow transition-all duration-500 ${
                      on ? 'left-[22px] bg-primary' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
              className="glass rounded-2xl p-6 text-center"
            >
              <p className="font-serif text-3xl text-primary">{s.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
