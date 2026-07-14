'use client'

import { useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEcoStore } from '@/lib/eco-store'

const challenges = [
  { icon: '🍶', text: 'Carry a reusable bottle everywhere you go today.' },
  { icon: '🍴', text: 'Refuse single-use cutlery for every meal today.' },
  { icon: '🛍️', text: 'Take a reusable bag on every errand today.' },
  { icon: '🚰', text: 'Refill instead of buying bottled water — all day.' },
  { icon: '📦', text: 'Choose one unpackaged item you would normally buy wrapped.' },
  { icon: '🧺', text: 'Skip one synthetic laundry load, or wash it cold.' },
  { icon: '☕', text: 'Bring your own cup for every coffee or tea today.' },
  { icon: '🥡', text: 'Say no to plastic takeout containers once today.' },
  { icon: '🏷️', text: 'Check one product label for polyethylene before buying.' },
  { icon: '🌊', text: 'Pick up three pieces of litter before they reach a drain.' },
]

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function challengeForDate(key: string) {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0
  return challenges[Math.abs(hash) % challenges.length]
}

const subscribeNever = () => () => {}

/** Today's date key, hydration-safe (null on the server pass). */
function useTodayKey() {
  return useSyncExternalStore(subscribeNever, todayKey, () => null)
}

export function DailyChallenge() {
  const dateKey = useTodayKey()
  const [celebrate, setCelebrate] = useState(false)
  const completeChallenge = useEcoStore((s) => s.completeChallenge)
  const completedOn = useEcoStore((s) => s.challengeCompletedOn)
  const streak = useEcoStore((s) => s.challengesCompleted)

  const challenge = dateKey ? challengeForDate(dateKey) : challenges[0]
  const doneToday = dateKey !== null && completedOn === dateKey

  const complete = () => {
    if (!dateKey || doneToday) return
    completeChallenge(dateKey)
    setCelebrate(true)
    setTimeout(() => setCelebrate(false), 2600)
  }

  return (
    <section
      id="challenge"
      aria-label="Daily eco challenge"
      className="relative py-24 md:py-32"
    >
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-primary">
            Daily Eco Challenge
          </p>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-tight text-foreground md:text-5xl">
            One small action. Today.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="glass glass-glow relative mt-12 overflow-hidden rounded-3xl p-8 text-center md:p-12"
        >
          {/* celebration bubbles */}
          <AnimatePresence>
            {celebrate && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {Array.from({ length: 18 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{
                      opacity: 0.9,
                      y: '110%',
                      x: `${(i * 61) % 100}%`,
                      scale: 0.4 + ((i * 7) % 10) / 12,
                    }}
                    animate={{ opacity: 0, y: '-20%' }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.6 + ((i * 13) % 10) / 8,
                      ease: 'easeOut',
                      delay: (i % 6) * 0.12,
                    }}
                    className="absolute h-4 w-4 rounded-full border border-primary/60 bg-primary/25"
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          <span aria-hidden="true" className="text-5xl">
            {challenge.icon}
          </span>
          <p className="mx-auto mt-6 max-w-md text-balance font-serif text-2xl leading-snug text-foreground md:text-3xl">
            {challenge.text}
          </p>

          <div className="mt-9">
            {doneToday ? (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-6 py-3 text-sm font-medium text-accent"
                role="status"
              >
                ✓ Completed — the ocean thanks you
              </motion.p>
            ) : (
              <button
                type="button"
                onClick={complete}
                className="glass glass-glow rounded-full bg-primary/20 px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-transform duration-300 hover:scale-105 hover:text-primary"
              >
                I did it
              </button>
            )}
          </div>

          {streak > 0 && (
            <p className="mt-6 text-xs tracking-wide text-muted-foreground">
              {streak} challenge{streak === 1 ? '' : 's'} completed so far
            </p>
          )}

          <p className="mt-3 text-xs text-muted-foreground/70">
            A new challenge appears every day.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
