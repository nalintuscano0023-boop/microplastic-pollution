'use client'

import { usePathname } from 'next/navigation'
import { motion, useScroll, useSpring } from 'framer-motion'

const storyLinks = [
  { label: 'The Journey', href: '/#journey' },
  { label: 'Plastic Vision', href: '/#vision' },
  { label: 'Hidden Sources', href: '/#hidden' },
]

const actionLinks = [
  { label: 'Risk Check', href: '/action#risk' },
  { label: 'Simulator', href: '/action#simulator' },
  { label: 'Pledge', href: '/action#pledge' },
]

export function OceanNavbar() {
  const pathname = usePathname()
  const onActionPage = pathname?.startsWith('/action') ?? false
  const links = onActionPage ? actionLinks : storyLinks

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        aria-label="Main"
        className="glass flex w-full max-w-3xl items-center justify-between rounded-full px-5 py-3"
      >
        <a
          href={onActionPage ? '/' : '/#top'}
          className="font-serif text-lg tracking-wide text-foreground"
        >
          The Unseen Ocean
        </a>
        <div className="hidden items-center gap-5 sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
          <a
            href={onActionPage ? '/' : '/action'}
            className="rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 text-sm text-foreground transition-all duration-300 hover:bg-primary/25 hover:text-primary"
          >
            {onActionPage ? '← The Story' : 'Action Hub'}
          </a>
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
