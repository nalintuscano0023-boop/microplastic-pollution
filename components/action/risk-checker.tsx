'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEcoStore } from '@/lib/eco-store'
import { MAX_SCORE, levelFor, questions } from '@/lib/risk-scoring'

export function RiskChecker() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const completeRiskCheck = useEcoStore((s) => s.completeRiskCheck)

  const finished = step >= questions.length
  const rawScore = answers.reduce(
    (sum, a, i) => sum + questions[i].options[a].weight,
    0,
  )
  const score = Math.round((rawScore / MAX_SCORE) * 100)
  const level = levelFor(score)

  const suggestions = finished
    ? answers
        .map((a, i) => questions[i].options[a])
        .filter((o) => o.weight >= 1 && o.suggestion)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3)
    : []

  const answer = (optionIdx: number) => {
    const next = [...answers, optionIdx]
    setAnswers(next)
    if (step + 1 >= questions.length) {
      const raw = next.reduce(
        (sum, a, i) => sum + questions[i].options[a].weight,
        0,
      )
      completeRiskCheck(Math.round((raw / MAX_SCORE) * 100))
      fetch('/api/risk-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: next }),
      }).catch(() => {})
    }
    setStep(step + 1)
  }

  const restart = () => {
    setAnswers([])
    setStep(0)
  }

  // SVG gauge geometry (semicircle, r=80)
  const ARC_LENGTH = Math.PI * 80

  return (
    <section
      id="risk"
      aria-label="Personal microplastic risk checker"
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
            Risk Checker
          </p>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-tight text-foreground md:text-5xl">
            How much plastic passes through your day?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Five quick questions. No judgment — just an honest picture of your
            everyday exposure, and where it is easiest to change.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="glass glass-glow mt-12 rounded-3xl p-8 md:p-10"
        >
          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div
                  className="flex items-center gap-1.5"
                  aria-label={`Question ${step + 1} of ${questions.length}`}
                >
                  {questions.map((q, i) => (
                    <span
                      key={q.id}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i < step
                          ? 'w-6 bg-accent'
                          : i === step
                            ? 'w-9 bg-primary'
                            : 'w-6 bg-secondary/70'
                      }`}
                    />
                  ))}
                </div>
                <h3 className="mt-6 font-serif text-2xl leading-snug text-foreground md:text-3xl">
                  {questions[step].prompt}
                </h3>
                <div className="mt-7 flex flex-col gap-3">
                  {questions[step].options.map((o, i) => (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => answer(i)}
                      className="glass rounded-2xl px-5 py-4 text-left text-sm leading-relaxed text-foreground/90 transition-all duration-300 hover:scale-[1.015] hover:border-primary/40 hover:text-primary"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="text-center"
                role="status"
              >
                <svg
                  viewBox="0 0 200 116"
                  className="mx-auto w-56"
                  aria-hidden="true"
                >
                  <path
                    d="M 20 106 A 80 80 0 0 1 180 106"
                    fill="none"
                    stroke="oklch(0.3 0.06 225 / 60%)"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <motion.path
                    d="M 20 106 A 80 80 0 0 1 180 106"
                    fill="none"
                    stroke={level.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={ARC_LENGTH}
                    initial={{ strokeDashoffset: ARC_LENGTH }}
                    animate={{
                      strokeDashoffset: ARC_LENGTH * (1 - score / 100),
                    }}
                    transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                  />
                  <text
                    x="100"
                    y="92"
                    textAnchor="middle"
                    className="fill-foreground font-serif"
                    fontSize="34"
                  >
                    {score}
                  </text>
                  <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    fontSize="10"
                    className="fill-muted-foreground"
                    letterSpacing="2"
                  >
                    RISK SCORE
                  </text>
                </svg>

                <p
                  className="mt-4 font-serif text-2xl"
                  style={{ color: level.color }}
                >
                  {level.name}
                </p>
                <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                  {level.blurb}
                </p>

                {suggestions.length > 0 && (
                  <div className="mt-8 flex flex-col gap-3 text-left">
                    <p className="text-xs uppercase tracking-[0.25em] text-primary">
                      Where to start
                    </p>
                    {suggestions.map((s, i) => (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.2, duration: 0.6 }}
                        className="glass rounded-2xl px-5 py-4 text-sm leading-relaxed text-foreground/85"
                      >
                        {s.suggestion}
                      </motion.div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={restart}
                  className="mt-8 rounded-full border border-border px-6 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  Retake the check
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
