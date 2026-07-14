'use client'

import { motion } from 'framer-motion'

type Resource = {
  icon: string
  category: string
  title: string
  body: string
  href: string
  cta: string
}

const resources: Resource[] = [
  {
    icon: '📍',
    category: 'Recycle nearby',
    title: 'Find recycling centres near you',
    body: 'Locate drop-off points for plastics, e-waste, and hard-to-recycle items in your neighbourhood.',
    href: 'https://www.google.com/maps/search/recycling+center+near+me',
    cta: 'Search near me',
  },
  {
    icon: '🗑️',
    category: 'Sort it right',
    title: 'Waste segregation guide',
    body: 'Wish-cycling contaminates whole batches. Learn which plastics your local stream actually accepts.',
    href: 'https://www.epa.gov/recycle/how-do-i-recycle-common-recyclables',
    cta: 'Learn the rules',
  },
  {
    icon: '🏖️',
    category: 'Join a cleanup',
    title: 'Ocean Conservancy cleanups',
    body: 'The International Coastal Cleanup has removed over 350 million pounds of trash from shorelines worldwide.',
    href: 'https://oceanconservancy.org/trash-free-seas/international-coastal-cleanup/',
    cta: 'Find a cleanup',
  },
  {
    icon: '🌏',
    category: 'Big picture',
    title: 'UN Beat Plastic Pollution',
    body: 'The UN Environment Programme campaign — global data, policy progress, and ways to get involved.',
    href: 'https://www.unep.org/interactives/beat-plastic-pollution/',
    cta: 'Explore the campaign',
  },
  {
    icon: '🔬',
    category: 'Go deeper',
    title: '5 Gyres Institute',
    body: 'The research organisation that helped discover the garbage patches — science-driven action against plastic.',
    href: 'https://www.5gyres.org/',
    cta: 'Read the science',
  },
  {
    icon: '🤝',
    category: 'Community',
    title: 'Plastic Free July',
    body: 'Join 100+ million people who take the challenge to refuse single-use plastics — far beyond July.',
    href: 'https://www.plasticfreejuly.org/',
    cta: 'Take the challenge',
  },
]

export function ResourceHub() {
  return (
    <section
      id="resources"
      aria-label="Local recycling and action resources"
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
            Act Locally
          </p>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-tight text-foreground md:text-6xl">
            The current is stronger together
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            Real organisations, real infrastructure, real people — pick a
            starting point.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((r, i) => (
            <motion.article
              key={r.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.12, ease: 'easeOut' }}
              className="glass group flex flex-col rounded-3xl p-7 transition-all duration-500 hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-xl"
                >
                  {r.icon}
                </span>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  {r.category}
                </p>
              </div>
              <h3 className="mt-4 font-serif text-xl text-foreground">
                {r.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {r.body}
              </p>
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary transition-all duration-300 group-hover:gap-2.5"
              >
                {r.cta} <span aria-hidden="true">→</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
