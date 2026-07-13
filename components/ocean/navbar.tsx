'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

const links = [
  { label: 'The Journey', href: '#journey' },
  { label: 'Hidden Sources', href: '#hidden' },
  { label: 'Reflection', href: '#reflection' },
]

export function OceanNavbar() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        aria-label="Main"
        className="glass flex w-full max-w-3xl items-center justify-between rounded-full px-5 py-3"
      >
        <a
          href="#top"
          className="font-serif text-lg tracking-wide text-foreground"
        >
          The Unseen Ocean
        </a>
        <div className="hidden items-center gap-6 sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div
          className="relative h-1.5 w-16 overflow-hidden rounded-full bg-secondary/60"
          role="progressbar"
          aria-label="Scroll journey progress"
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-primary"
            style={{ scaleX: progress }}
          />
        </div>
      </nav>
    </header>
  )
}
