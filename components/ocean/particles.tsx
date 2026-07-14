'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  opacity: number
  phase: number
}

export function OceanParticles({
  density = 60,
  className,
  color = '180, 230, 240',
}: {
  density?: number
  className?: string
  /** RGB triplet, e.g. "255, 170, 90" */
  color?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let particles: Particle[] = []
    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const init = () => {
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.25 + 0.05),
        opacity: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        const sway = Math.sin(t / 2400 + p.phase) * 0.3
        p.x += p.vx + sway * 0.15
        p.y += p.vy
        if (p.y < -6) {
          p.y = height + 6
          p.x = Math.random() * width
        }
        if (p.x < -6) p.x = width + 6
        if (p.x > width + 6) p.x = -6
        const flicker = 0.75 + Math.sin(t / 1600 + p.phase) * 0.25
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${p.opacity * flicker})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    resize()
    init()
    if (!reduced) {
      raf = requestAnimationFrame(draw)
    } else {
      draw(0)
      cancelAnimationFrame(raf)
    }

    const onResize = () => {
      resize()
      init()
      if (reduced) {
        draw(0)
        cancelAnimationFrame(raf)
      }
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [density, color])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ''}`}
    />
  )
}
