'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { OceanParticles } from '@/components/ocean/particles'
import { useEcoStore } from '@/lib/eco-store'

const commitments = [
  { id: 'single-use', icon: '🚯', label: 'Reduce single-use plastic' },
  { id: 'bottle', icon: '🍶', label: 'Carry a reusable bottle' },
  { id: 'recycling', icon: '♻️', label: 'Improve my recycling habits' },
  { id: 'cleanup', icon: '🏖️', label: 'Support beach & river cleanups' },
  { id: 'products', icon: '🌿', label: 'Choose sustainable products' },
  { id: 'voice', icon: '📣', label: 'Share what I learned today' },
]

export function Pledge() {
  const [selected, setSelected] = useState<string[]>([])
  const submitPledge = useEcoStore((s) => s.submitPledge)
  const pledgeSubmitted = useEcoStore((s) => s.pledgeSubmitted)
  const savedPledges = useEcoStore((s) => s.pledges)

  const toggle = (id: string) =>
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id],
    )

  const submit = () => {
    if (selected.length === 0) return
    submitPledge(selected)
  }

  const chosen = pledgeSubmitted ? savedPledges : selected

  return (
    <section
      id="pledge"
      aria-label="Personal environmental pledge"
      className="relative overflow-hidden py-24 md:py-36"
    >
      <OceanParticles density={40} />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-abyss to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-primary">
            Your Pledge
          </p>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-tight text-foreground md:text-6xl">
            The journey ends with a promise
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Choose what you are willing to carry back to the surface. No
            accounts, no emails — a promise between you and the water.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!pledgeSubmitted ? (
            <motion.div
              key="picker"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {commitments.map((c, i) => {
                  const active = selected.includes(c.id)
                  return (
                    <motion.button
                      key={c.id}
                      type="button"
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-8%' }}
                      transition={{ duration: 0.7, delay: (i % 3) * 0.1 }}
                      onClick={() => toggle(c.id)}
                      aria-pressed={active}
                      className={`glass rounded-3xl p-6 text-center transition-all duration-400 hover:scale-[1.02] ${
                        active
                          ? 'border-primary/60 bg-primary/15 shadow-[0_0_30px_oklch(0.82_0.13_195_/_25%)]'
                          : ''
                      }`}
                    >
                      <span aria-hidden="true" className="text-3xl">
                        {c.icon}
                      </span>
                      <p
                        className={`mt-3 text-sm font-medium ${
                          active ? 'text-primary' : 'text-foreground/85'
                        }`}
                      >
                        {c.label}
                      </p>
                      <p
                        aria-hidden="true"
                        className={`mt-2 text-xs transition-opacity duration-300 ${
                          active ? 'text-accent opacity-100' : 'opacity-0'
                        }`}
                      >
                        ✓ pledged
                      </p>
                    </motion.button>
                  )
                })}
              </div>

              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={submit}
                  disabled={selected.length === 0}
                  className="glass glass-glow rounded-full bg-primary/20 px-10 py-4 text-sm font-medium tracking-wide text-foreground transition-all duration-300 hover:scale-105 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                >
                  Make my pledge{' '}
                  {selected.length > 0 && `(${selected.length})`}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="celebrated"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative mt-12 text-center"
            >
              {/* rising wave rings */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0.5, scale: 0.4 }}
                    animate={{ opacity: 0, scale: 2.4 }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      delay: i * 0.85,
                      ease: 'easeOut',
                    }}
                    className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/50"
                  />
                ))}
              </div>

              <motion.span
                aria-hidden="true"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.2 }}
                className="relative inline-flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-4xl"
              >
                🌊
              </motion.span>

              <h3 className="mt-8 text-balance font-serif text-3xl italic leading-snug text-foreground md:text-4xl">
                &ldquo;Every small action creates a wave of change.&rdquo;
              </h3>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Your pledge is saved. The ocean will not remember your name —
                but it will feel the difference.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                {commitments
                  .filter((c) => chosen.includes(c.id))
                  .map((c) => (
                    <span
                      key={c.id}
                      className="glass rounded-full px-4 py-2 text-xs text-foreground/85"
                    >
                      {c.icon} {c.label}
                    </span>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="relative z-10 mt-24 text-center text-xs tracking-wide text-muted-foreground/70">
          The Unseen Ocean — an immersive story about microplastic pollution.
        </footer>
      </div>
    </section>
  )
}
