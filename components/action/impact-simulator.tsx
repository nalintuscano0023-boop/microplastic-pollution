'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useEcoStore } from '@/lib/eco-store'
import { usePrefersReducedMotion } from '@/lib/use-media'

const OceanScene = dynamic(() => import('./ocean-scene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0a3d62]">
      <p className="text-sm tracking-wide text-foreground/60">
        Filling the ocean…
      </p>
    </div>
  ),
})

type Habit = {
  id: string
  label: string
  unit: string
  max: number
  weight: number
  initial: number
}

const habits: Habit[] = [
  { id: 'bottles', label: 'Plastic bottles', unit: 'per week', max: 20, weight: 0.3, initial: 6 },
  { id: 'laundry', label: 'Synthetic laundry loads', unit: 'per week', max: 10, weight: 0.25, initial: 4 },
  { id: 'singleuse', label: 'Single-use plastics', unit: 'per day', max: 10, weight: 0.25, initial: 3 },
  { id: 'packaging', label: 'Plastic-packaged meals', unit: 'per week', max: 14, weight: 0.2, initial: 7 },
]

function healthLabel(health: number) {
  if (health > 80) return { text: 'Thriving reef', color: 'text-accent' }
  if (health > 60) return { text: 'Recovering waters', color: 'text-primary' }
  if (health > 40) return { text: 'Stressed ecosystem', color: 'text-[oklch(0.78_0.15_55)]' }
  return { text: 'Critical decline', color: 'text-[oklch(0.7_0.17_30)]' }
}

export function ImpactSimulator() {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(habits.map((h) => [h.id, h.initial])),
  )
  const [inView, setInView] = useState(false)
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const markSimulatorUsed = useEcoStore((s) => s.useSimulator)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const pollution = habits.reduce(
    (sum, h) => sum + (values[h.id] / h.max) * h.weight,
    0,
  )
  const health = Math.round((1 - pollution) * 100)
  const label = healthLabel(health)

  const bottlesYear = values.bottles * 52
  const fibersYear = values.laundry * 52 * 700_000
  const singleUseYear = values.singleuse * 365

  const setHabit = (id: string, v: number) => {
    setValues((prev) => ({ ...prev, [id]: v }))
    markSimulatorUsed()
  }

  return (
    <section
      ref={sectionRef}
      id="simulator"
      aria-label="Ocean impact simulator"
      className="relative py-24 md:py-32"
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
            Ocean Impact Simulator
          </p>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-tight text-foreground md:text-6xl">
            Your habits, played forward
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            Move the sliders and watch the same stretch of ocean respond. Fewer
            plastics in your week means clearer water, brighter coral, and fish
            that return.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="mt-14 grid gap-6 lg:grid-cols-[1fr_22rem]"
        >
          {/* 3D scene */}
          <div className="relative overflow-hidden rounded-3xl border border-border shadow-2xl">
            <div className="relative aspect-[16/10] w-full lg:aspect-auto lg:h-full lg:min-h-[30rem]">
              {inView && (
                <OceanScene
                  pollution={pollution}
                  reduced={reduced}
                  active={inView}
                />
              )}
              {!inView && <div className="h-full w-full bg-[#0a3d62]" />}
            </div>

            {/* health readout */}
            <div
              className="glass absolute left-4 top-4 rounded-2xl px-5 py-3.5"
              role="status"
              aria-live="polite"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Ocean health
              </p>
              <p className="mt-0.5 font-serif text-3xl text-foreground">
                {health}
                <span className="text-base text-muted-foreground">%</span>
              </p>
              <p className={`text-xs font-medium ${label.color}`}>{label.text}</p>
            </div>
          </div>

          {/* controls */}
          <div className="glass glass-glow flex flex-col justify-between gap-6 rounded-3xl p-7">
            <div className="flex flex-col gap-6">
              {habits.map((h) => (
                <div key={h.id}>
                  <div className="flex items-baseline justify-between">
                    <label
                      htmlFor={`sim-${h.id}`}
                      className="text-sm text-foreground/90"
                    >
                      {h.label}
                    </label>
                    <span className="font-serif text-xl text-primary">
                      {values[h.id]}
                      <span className="ml-1 text-[10px] tracking-wide text-muted-foreground">
                        {h.unit}
                      </span>
                    </span>
                  </div>
                  <input
                    id={`sim-${h.id}`}
                    type="range"
                    min={0}
                    max={h.max}
                    value={values[h.id]}
                    onChange={(e) => setHabit(h.id, Number(e.target.value))}
                    className="eco-slider mt-2 w-full"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
              <p>
                At this pace, one year adds{' '}
                <strong className="text-foreground/90">
                  {bottlesYear.toLocaleString()} bottles
                </strong>
                ,{' '}
                <strong className="text-foreground/90">
                  {(fibersYear / 1_000_000).toFixed(0)}M microfibers
                </strong>{' '}
                and{' '}
                <strong className="text-foreground/90">
                  {singleUseYear.toLocaleString()} single-use items
                </strong>{' '}
                to the waste stream.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
