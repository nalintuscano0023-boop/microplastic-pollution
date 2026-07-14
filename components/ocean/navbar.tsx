'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'

const sections = [
  { num: '01', label: 'The Journey', href: '/' },
  { num: '02', label: 'The Invisible', href: '/hidden' },
  { num: '03', label: 'The Ripple', href: '/ripple' },
  { num: '04', label: 'Take Action', href: '/action' },
]

export function OceanNavbar() {
  const pathname = usePathname() ?? '/'
  const [menuOpen, setMenuOpen] = useState(false)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        aria-label="Main"
        className="glass w-full max-w-4xl rounded-3xl px-5 py-3"
      >
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 font-serif text-lg tracking-wide text-foreground"
          >
            The Unseen Ocean
          </Link>

          {/* Desktop section links */}
          <div className="hidden items-center gap-1 md:flex">
            {sections.map((s) => {
              const active = isActive(s.href)
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-colors duration-300 ${
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span
                    className={`text-[10px] tabular-nums ${
                      active ? 'text-primary/80' : 'text-muted-foreground/60'
                    }`}
                  >
                    {s.num}
                  </span>
                  {s.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle sections menu"
            className="flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm text-foreground md:hidden"
          >
            {sections.find((s) => isActive(s.href))?.num ?? '01'}
            <span className="text-muted-foreground">Sections</span>
          </button>
        </div>

        {/* Scroll progress */}
        <div
          className="relative mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary/40"
          role="progressbar"
          aria-label="Scroll progress"
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-primary"
            style={{ scaleX: progress }}
          />
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden md:hidden"
            >
              <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3">
                {sections.map((s) => {
                  const active = isActive(s.href)
                  return (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="text-[10px] tabular-nums text-muted-foreground/70">
                        {s.num}
                      </span>
                      {s.label}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
