'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BADGES,
  HOTSPOT_COUNT,
  earnedBadges,
  useEcoStore,
} from '@/lib/eco-store'

export function QuestPanel() {
  const [openPanel, setOpenPanel] = useState(false)
  const state = useEcoStore()
  const earned = earnedBadges(state)

  const quests = [
    {
      label: 'Complete the Plastic Time Machine',
      done: state.timeMachineComplete,
    },
    { label: 'Activate Hidden Plastic Vision', done: state.visionActivated },
    {
      label: `Discover all hidden sources (${state.discoveredHotspots.length}/${HOTSPOT_COUNT})`,
      done: state.discoveredHotspots.length >= HOTSPOT_COUNT,
    },
    { label: 'Check your microplastic risk', done: state.riskCheckDone },
    { label: 'Run the Ocean Impact Simulator', done: state.simulatorUsed },
    { label: 'Complete a Daily Eco Challenge', done: state.challengesCompleted > 0 },
    { label: 'Make your ocean pledge', done: state.pledgeSubmitted },
  ]

  const doneCount = quests.filter((q) => q.done).length

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {openPanel && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            role="dialog"
            aria-label="EcoQuest progress"
            className="glass glass-glow w-[19rem] max-w-[calc(100vw-2.5rem)] rounded-3xl p-5"
          >
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-[0.25em] text-primary">
                EcoQuest
              </p>
              <p className="font-serif text-2xl text-foreground">
                {state.ecoPoints}
                <span className="ml-1 text-xs text-muted-foreground">pts</span>
              </p>
            </div>

            {/* Badges */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {BADGES.map((b) => {
                const has = earned.includes(b.id)
                return (
                  <div
                    key={b.id}
                    title={`${b.name} — ${b.description}`}
                    className={`flex aspect-square flex-col items-center justify-center rounded-2xl border text-center transition-all duration-500 ${
                      has
                        ? 'border-primary/50 bg-primary/15 shadow-[0_0_18px_oklch(0.82_0.13_195_/_25%)]'
                        : 'border-border bg-secondary/20 opacity-45 grayscale'
                    }`}
                  >
                    <span className="text-xl" aria-hidden="true">
                      {b.icon}
                    </span>
                    <span className="mt-0.5 px-1 text-[8px] leading-tight text-foreground/80">
                      {b.name}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Quest list */}
            <ul className="mt-4 space-y-2">
              {quests.map((q) => (
                <li
                  key={q.label}
                  className={`flex items-start gap-2.5 text-xs leading-relaxed ${
                    q.done ? 'text-foreground/85' : 'text-muted-foreground'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                      q.done
                        ? 'border-accent/70 bg-accent/25 text-accent'
                        : 'border-border'
                    }`}
                  >
                    {q.done ? '✓' : ''}
                  </span>
                  {q.label}
                  <span className="sr-only">
                    {q.done ? ' — completed' : ' — not completed'}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpenPanel((v) => !v)}
        aria-expanded={openPanel}
        aria-label={`EcoQuest progress: ${state.ecoPoints} points, ${doneCount} of ${quests.length} quests complete`}
        className="glass glass-glow flex items-center gap-2.5 rounded-full py-2.5 pl-4 pr-5 text-sm font-medium text-foreground transition-transform duration-300 hover:scale-105"
      >
        <span aria-hidden="true" className="text-base">
          🐚
        </span>
        <span>{state.ecoPoints} pts</span>
        <span className="text-xs text-muted-foreground">
          {doneCount}/{quests.length}
        </span>
      </button>
    </div>
  )
}
