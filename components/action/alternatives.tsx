'use client'

import { motion } from 'framer-motion'

type Swap = {
  from: string
  fromIcon: string
  to: string
  toIcon: string
  why: string
  cost: string
}

const swaps: Swap[] = [
  {
    from: 'Plastic bottle',
    fromIcon: '🥤',
    to: 'Steel bottle',
    toIcon: '🍶',
    why: 'One steel bottle replaces ~1,500 plastic bottles over its lifetime and sheds zero particles into your water.',
    cost: 'Pays for itself in about 3 weeks',
  },
  {
    from: 'Plastic sponge',
    fromIcon: '🧽',
    to: 'Natural loofah',
    toIcon: '🌿',
    why: 'Loofahs are a dried plant — they scrub just as hard, then compost completely instead of shedding foam fragments.',
    cost: 'Costs about the same',
  },
  {
    from: 'Plastic tea bags',
    fromIcon: '🫖',
    to: 'Loose leaf tea',
    toIcon: '🍃',
    why: 'Skips billions of micro and nanoplastics per cup, tastes noticeably better, and creates zero bag waste.',
    cost: 'Often cheaper per cup',
  },
  {
    from: 'Plastic cutting board',
    fromIcon: '🔪',
    to: 'Wooden board',
    toIcon: '🪵',
    why: 'Wood is naturally antimicrobial and self-healing — no plastic particles carved into your food with every chop.',
    cost: 'Lasts decades with care',
  },
  {
    from: 'Synthetic fleece',
    fromIcon: '🧥',
    to: 'Cotton & wool layers',
    toIcon: '🧶',
    why: 'Natural fibers shed too — but those fibers biodegrade in months instead of persisting for centuries.',
    cost: 'Comparable at most budgets',
  },
  {
    from: 'Cling film',
    fromIcon: '🎞️',
    to: 'Beeswax wraps',
    toIcon: '🐝',
    why: 'Reusable for about a year each, mold to any container, and finish their life in the compost bin.',
    cost: 'Cheaper within 2 months',
  },
]

export function Alternatives() {
  return (
    <section
      id="alternatives"
      aria-label="Smart sustainable alternatives"
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
            Smart Swaps
          </p>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-tight text-foreground md:text-6xl">
            Every plastic has a better twin
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            No lifestyle overhaul required. Each swap below is practical,
            affordable, and quietly keeps plastic out of the water.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {swaps.map((s, i) => (
            <motion.article
              key={s.from}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.12, ease: 'easeOut' }}
              className="glass group rounded-3xl p-7 transition-all duration-500 hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/50 text-xl opacity-60 grayscale transition-all duration-500 group-hover:opacity-40"
                >
                  {s.fromIcon}
                </span>
                <span aria-hidden="true" className="text-primary">
                  →
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-accent/15 text-xl shadow-[0_0_16px_oklch(0.75_0.12_185_/_20%)]"
                >
                  {s.toIcon}
                </span>
              </div>
              <h3 className="mt-5 font-serif text-xl text-foreground">
                <span className="text-muted-foreground line-through decoration-1">
                  {s.from}
                </span>{' '}
                → {s.to}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.why}
              </p>
              <p className="mt-4 inline-block rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs text-accent">
                {s.cost}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
